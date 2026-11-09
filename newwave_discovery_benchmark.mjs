#!/usr/bin/env node
/**
 * NewWave Africa discovery evidence harness (read-only, no external packages).
 * Place in the repository root and run with Node 22:
 *   node --experimental-strip-types newwave_discovery_benchmark.mjs --out ./benchmark-results
 *   node --experimental-strip-types newwave_discovery_benchmark.mjs --evaluation ./my-reviewed-evaluation.json --out ./benchmark-results
 * The included synthetic checks diagnose algorithm behavior, not user relevance.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getDiscovery,CATEGORIES} from './lib/discovery.ts';
import {DISCOVERY_SCENARIO_STORIES,SCENARIO_CATEGORY_COUNT} from './lib/discovery-scenario.ts';
const sourceRoot=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const arg=(key)=>{const i=args.indexOf(key);return i<0?undefined:args[i+1]};
const out=resolve(arg('--out')||join(sourceRoot,'benchmark-results'));
const expectedSource='6084ddec6066f24f464e24da8db1f24ba73ac5b6';
const expectedFixture='a68a8a88129fe64d6ce4903b820e7eadc1b65ea9';
const baselineCommit='0c88a1f35a0eab19c26a52411331d64eb6d21555';
function hashGitBlob(filepath){const bytes=readFileSync(filepath);return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')}
const sourceHash=hashGitBlob(join(sourceRoot,'lib','discovery.ts'));
const fixtureHash=hashGitBlob(join(sourceRoot,'lib','discovery-scenario.ts'));
if(!args.includes('--allow-changed-source')){
  assert.equal(sourceHash,expectedSource,'Reviewed source changed. Use --allow-changed-source only after inspecting the diff.');
  assert.equal(fixtureHash,expectedFixture,'Reviewed fixture changed. Use --allow-changed-source only after inspecting the diff.');
}
mkdirSync(out,{recursive:true});
const baseOptions={query:'',interest:'All categories',diversity:0,savedOnly:false,saved:[]};
const weights=[0,1,10,20,30,40,50,60,70,80,90,100];
const rows=[];
const cover=(stories)=>new Set(stories.map(s=>s.category)).size;
const ids=(stories)=>stories.map(s=>s.id);
const matching=(stories,category)=>stories.filter(s=>s.category===category).length;
function record(dataset,stories,options={},weightsToUse=weights){
  const opts={...baseOptions,...options};
  for(const w of weightsToUse){
    const result=getDiscovery(stories,{...opts,diversity:w});
    const baseline=result.baseline.slice(0,result.windowSize);
    const weighted=result.ranked.slice(0,result.windowSize);
    rows.push({dataset,query:opts.query,interest:opts.interest,weight:w,candidates:result.ranked.length,
      population:stories.length,top_k:result.windowSize,collection_categories:cover(stories),
      baseline_coverage:result.baselineCoverage,weighted_coverage:result.diverseCoverage,
      coverage_delta:result.diverseCoverage-result.baselineCoverage,
      baseline_interest_in_top_k:opts.interest==='All categories'?null:matching(baseline,opts.interest),
      weighted_interest_in_top_k:opts.interest==='All categories'?null:matching(weighted,opts.interest),
      order_changed:JSON.stringify(ids(baseline))!==JSON.stringify(ids(weighted)),
      baseline_ids:ids(baseline).join(';'),ranked_ids:ids(weighted).join(';')});
  }
}
function makeStory(id,cat,title,extra={}){return {id,category:cat,title,excerpt:'Invented benchmark text - not a real African creator or reader.',country:'South Africa',author:'Synthetic test',language:'English',tags:[],date:'2026-11-09',sample:true,...extra};}
function rng(seed){let v=seed>>>0;return ()=>((v=(1664525*v+1013904223)>>>0)/4294967296)}
function generated(seed){const random=rng(seed);const shares=[32,7,6,5,5,4,3,2];let n=0;const all=[];
 for(let i=0;i<shares.length;i++)for(let j=0;j<shares[i];j++){const order=Math.floor(random()*100000);all.push(makeStory('fixture-'+seed+'-'+(++n),CATEGORIES[i],String(order).padStart(5,'0')+' invented topic '+n));}
 return all;
}
record('original-12-fictional',DISCOVERY_SCENARIO_STORIES);
record('original-12-technology-interest',DISCOVERY_SCENARIO_STORIES,{interest:CATEGORIES[0]});
for(const seed of [11,29,47]){
 const data=generated(seed);
 record('skewed-64-seed-'+seed,data);
 record('skewed-64-tech-interest-seed-'+seed,data,{interest:CATEGORIES[0]});
}
const single=Array.from({length:20},(_,i)=>makeStory('single-'+i,CATEGORIES[0],String(i).padStart(2,'0')+' single category'));
record('single-category-20',single);
record('original-12-sparse-search',DISCOVERY_SCENARIO_STORIES,{query:'water-saving'});
// Search-eligible stories stay constant while off-query titles increase Technology population counts.
const eligible=[makeStory('eligible-tech-1',CATEGORIES[0],'Alpha focus result',{tags:['focus-only']}),
  makeStory('eligible-tech-2',CATEGORIES[0],'Beta focus result',{tags:['focus-only']}),
  makeStory('eligible-climate-1',CATEGORIES[3],'Gamma focus result',{tags:['focus-only']}),
  makeStory('eligible-climate-2',CATEGORIES[3],'Delta focus result',{tags:['focus-only']})];
const hidden=Array.from({length:24},(_,i)=>makeStory('unrelated-'+i,CATEGORIES[0],'Off-topic '+i));
record('search-four-matched-only',eligible,{query:'focus-only'});
record('search-four-matched-plus-24-offtopic',eligible.concat(hidden),{query:'focus-only'});
const shortlist=(dataset,weight)=>{const item=rows.find(r=>r.dataset===dataset&&r.weight===weight);assert.ok(item,`row missing ${dataset}/${weight}`);return item;};
assert.equal(shortlist('original-12-fictional',0).weighted_coverage,1,'Original scenario 0% must be 1/5');
assert.equal(shortlist('original-12-fictional',60).weighted_coverage,5,'Original scenario 60% must be 5/5');
assert.equal(SCENARIO_CATEGORY_COUNT,5);
const positive=rows.filter(r=>r.dataset==='original-12-fictional'&&r.weight>0);
const uniquePositiveOrder=new Set(positive.map(r=>r.ranked_ids)).size;
assert.equal(uniquePositiveOrder,1,'All positive weights on this scenario should produce the same ordering');
const zero=shortlist('original-12-fictional',0);
assert.equal(zero.ranked_ids,zero.baseline_ids,'0% must equal relevance-only baseline');
assert.equal(shortlist('single-category-20',100).weighted_coverage,1,'Cannot create categories absent from collection');
assert.equal(shortlist('original-12-sparse-search',60).top_k,1,'Search should bound the eligible top-k');
const filteredA=shortlist('search-four-matched-only',60),filteredB=shortlist('search-four-matched-plus-24-offtopic',60);
assert.equal(filteredA.candidates,filteredB.candidates,'Eligible search candidates must be identical');
const eligibleSorted=eligible.map(s=>s.id).sort().join(';');
const outputA=filteredA.ranked_ids.split(';').sort().join(';'),outputB=filteredB.ranked_ids.split(';').sort().join(';');
assert.equal(outputA,eligibleSorted);assert.equal(outputB,eligibleSorted);
const filteredChangesOrder=filteredA.ranked_ids!==filteredB.ranked_ids;
const result={label:'Synthetic regression and stress checks; not real-user relevance evaluation',
  baseline_commit:baselineCommit,source_blob_sha:sourceHash,fixture_blob_sha:fixtureHash,
  executed_at:new Date().toISOString(),node:process.version,rows:rows.length,
  checks:{original_0pct_coverage:zero.weighted_coverage,original_60pct_coverage:shortlist('original-12-fictional',60).weighted_coverage,
    original_positive_weights_distinct_top8_orders:uniquePositiveOrder,
    original_tech_interest_60pct:shortlist('original-12-technology-interest',60).weighted_interest_in_top_k,
    original_tech_interest_100pct:shortlist('original-12-technology-interest',100).weighted_interest_in_top_k,
    filtered_search_same_eligible_count:filteredA.candidates,
    filtered_search_order_changed_when_adding_offquery_stories:filteredChangesOrder,
    filtered_search_before:filteredA.ranked_ids,filtered_search_after:filteredB.ranked_ids,
    no_real_relevance_judgments_collected:true},
  limitations:['Synthetic cases assess reproducibility and failure modes, not reader relevance, fairness, usability or real creator impact.',
    'All-category relevance is constant in current implementation, so category scarcity determines order for any nonzero positive weight.',
    'Category scarcity uses counts from the complete collection, not only the current query result set.']};
const csvKeys=Object.keys(rows[0]);
const csvEscape=v=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s};
const csv=[csvKeys.join(','),...rows.map(row=>csvKeys.map(key=>csvEscape(row[key])).join(','))].join('\n')+'\n';
writeFileSync(join(out,'synthetic_weight_sweep.csv'),csv);
writeFileSync(join(out,'synthetic_results.json'),JSON.stringify(result,null,2)+'\n');
console.log('SYNTHETIC CHECKS:',JSON.stringify(result.checks,null,2));
console.log('ROWS:',rows.length,'SOURCE SHA:',sourceHash,'RESULT PATH:',out);

// Optional evaluation is held out, manually labeled content. No dataset is shipped, collected or fabricated.
const evalPath=arg('--evaluation');
if(evalPath){
 const data=JSON.parse(readFileSync(resolve(evalPath),'utf8'));
 assert.ok(Array.isArray(data.stories)&&Array.isArray(data.queries),'Expected stories[] and queries[]');
 assert.ok(data.queries.length>0,'No evaluation queries');
 const storyMap=new Map(data.stories.map(s=>[s.id,s]));
 assert.equal(storyMap.size,data.stories.length,'Duplicate story IDs');
 const rated=[];
 const dcg=grades=>grades.reduce((total,g,i)=>total+(2**g-1)/Math.log2(i+2),0);
 const ndcg=(list,judgments,eligible)=>{
   const ideal=eligible.map(s=>judgments[s.id]).sort((a,b)=>b-a).slice(0,8);
   const denominator=dcg(ideal);
   return denominator===0?null:dcg(list.slice(0,8).map(s=>judgments[s.id]))/denominator;
 };
 for(const q of data.queries){
   assert.ok(typeof q.id==='string'&&q.id&&typeof q.query==='string'&&typeof q.interest==='string'&&q.judgments&&typeof q.judgments==='object');
   const opts={...baseOptions,query:q.query,interest:q.interest,diversity:60};
   const b=getDiscovery(data.stories,{...opts,diversity:0});
   const w=getDiscovery(data.stories,opts);
   assert.ok(w.ranked.length>0,'No candidates for '+q.id);
   for(const s of w.ranked){assert.ok(Object.hasOwn(q.judgments,s.id),`Missing blinded relevance judgment for ${q.id}/${s.id}`);assert.ok([0,1,2,3].includes(q.judgments[s.id]),'Judgments must be 0..3')}
   const bN=ndcg(b.baseline,q.judgments,b.ranked),wN=ndcg(w.ranked,q.judgments,b.ranked);
   rated.push({id:q.id,relevant_positive:bN!==null,baseline_ndcg8:bN,weighted_ndcg8:wN,
     delta_ndcg8:bN===null?null:wN-bN,baseline_coverage8:b.baselineCoverage,weighted_coverage8:w.diverseCoverage,
     delta_coverage8:w.diverseCoverage-b.baselineCoverage,source:'blind human judgments supplied by evaluator; not collected by this script'});
 }
 const valid=rated.filter(x=>x.relevant_positive),mean=(xs)=>xs.reduce((a,b)=>a+b,0)/xs.length;
 const diffs=valid.map(x=>x.delta_ndcg8),coverDeltas=rated.map(x=>x.delta_coverage8);
 const rand=rng(20261109);const boot=[];
 for(let n=0;n<2000&&diffs.length>0;n++){const sample=Array.from({length:diffs.length},()=>diffs[Math.floor(rand()*diffs.length)]);boot.push(mean(sample));}
 boot.sort((a,b)=>a-b);
 const confidence=boot.length?[boot[Math.floor(0.025*(boot.length-1))],boot[Math.floor(0.975*(boot.length-1))]]:null;
 const evaluated={source_commit:baselineCommit,source_sha:sourceHash,number_of_queries:rated.length,queries_with_nonzero_ideal_dcg:valid.length,
   mean_ndcg_delta:diffs.length?mean(diffs):null,bootstrap_95pct_interval_for_mean_delta:confidence,
   mean_category_coverage_delta:coverDeltas.length?mean(coverDeltas):null,
   missing_relevance_queries:rated.length-valid.length,
   results:rated,disclaimer:'Independent human-judgment quality is not verified by this script. Reviewer independence, licenses and sampling require separate audit.'};
 writeFileSync(join(out,'human_judgment_evaluation.json'),JSON.stringify(evaluated,null,2)+'\n');
 console.log('HUMAN-LABELED EVAL:',JSON.stringify({n:rated.length,delta:evaluated.mean_ndcg_delta,ci:confidence,coverage:evaluated.mean_category_coverage_delta}));
}
