#!/usr/bin/env node
/**
 * Phase 2 formative-study scorer: restricted, non-identifying tabular inputs only.
 * No network, external packages, transcript storage or raw participant output.
 * Participants and consent records are handled privately by human researchers.
 *
 * node scripts/research/score-phase2-study.mjs --input /private/phase2-study.csv --release-sha <40-hex-commit>
 * Exit: 0=thresholds met, 2=incomplete or failed, 1=invalid input.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const HEADER=[
  'participant_id','task_id','consent_confirmed','completion','seconds_to_complete',
  'help_requests','error_count','privacy_or_rights_issue','severity',
  'model_understood','fictional_understood','local_draft_understood',
  'condition_first','list_preference'
];
const TASKS={R:['R1','R2','R3','R4','R5'],C:['C1','C2','C3','C4','C5']};
const allowed=(value,choices)=>choices.includes(value);
function parseNumber(value,field){
  assert.match(value,/^(0|[1-9][0-9]{0,3})$/,'Invalid '+field);
  return Number(value);
}
export function parseStudyCsv(raw){
  assert.equal(typeof raw,'string');
  const lines=raw.trim().replace(/\r\n/g,'\n').split('\n');
  assert.equal(lines.shift(),HEADER.join(','),'Use the exact Phase 2 CSV header');
  const rows=[];
  for(const [i,line] of lines.entries()){
    if(!line.trim())continue;
    assert.ok(!/["\r\t;]/.test(line),'Quoted, multiline or free-text cells are not allowed (row '+(i+2)+')');
    const cells=line.split(',').map(value=>value.trim());
    assert.equal(cells.length,HEADER.length,'Unexpected column count (row '+(i+2)+')');
    const row=Object.fromEntries(HEADER.map((name,j)=>[name,cells[j]]));
    assert.match(row.participant_id,/^[RC](0[1-9]|10)$/,'Use anonymous R01-R10 / C01-C10 study IDs');
    const role=row.participant_id[0];
    assert.ok(TASKS[role].includes(row.task_id),'Unexpected task ID for role (row '+(i+2)+')');
    assert.ok(allowed(row.consent_confirmed,['yes','no']),'Consent confirmation must be yes or no');
    assert.ok(allowed(row.completion,['yes','no','not_tested']),'Completion must be yes/no/not_tested');
    assert.ok(allowed(row.privacy_or_rights_issue,['none','significant','critical']),'Invalid privacy issue classification');
    assert.ok(allowed(row.severity,['none','P0','P1','P2']),'Invalid issue severity');
    row.help_requests=parseNumber(row.help_requests,'help_requests');
    row.error_count=parseNumber(row.error_count,'error_count');
    if(row.completion==='not_tested')assert.equal(row.seconds_to_complete,'','Unperformed tasks must not contain durations');
    else{
      row.seconds_to_complete=parseNumber(row.seconds_to_complete,'seconds_to_complete');
      assert.ok(row.seconds_to_complete>0 && row.seconds_to_complete<=7200,'Duration outside 1–7200 seconds');
    }
    if(row.consent_confirmed==='no')assert.equal(row.completion,'not_tested','Do not conduct a task without consent');
    if(row.task_id==='R4'){
      for(const key of ['model_understood','fictional_understood','local_draft_understood']){
        assert.ok(allowed(row[key],['yes','no','not_tested']),'Invalid comprehension answer');
      }
    }else{
      for(const key of ['model_understood','fictional_understood','local_draft_understood'])assert.equal(row[key],'','Only R4 holds scored comprehension answers');
    }
    if(row.task_id==='R3'){
      if(row.completion==='not_tested'){
        assert.equal(row.condition_first,'');
        assert.equal(row.list_preference,'');
      }else{
        assert.ok(allowed(row.condition_first,['baseline','diverse']),'R3 condition order required');
        assert.ok(allowed(row.list_preference,['baseline','diverse','neither']),'R3 preference required');
      }
    }else{
      assert.equal(row.condition_first,'','Only R3 records condition order');
      assert.equal(row.list_preference,'','Only R3 records a list preference');
    }
    rows.push(row);
  }
  const ids=new Set();
  for(const row of rows){
    const id=row.participant_id+'/'+row.task_id;
    assert.ok(!ids.has(id),'Duplicate participant/task row');
    ids.add(id);
  }
  return rows;
}
const median=values=>{
  if(values.length===0)return null;
  const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};
export function summarizeStudy(rows,releaseSha){
  assert.match(releaseSha,/^[0-9a-f]{40}$/,'Specify the exact 40-character tested production commit');
  const requiredIds=[...Array.from({length:10},(_,i)=>'R'+String(i+1).padStart(2,'0')),
    ...Array.from({length:10},(_,i)=>'C'+String(i+1).padStart(2,'0'))];
  const byKey=new Map(rows.map(r=>[r.participant_id+'/'+r.task_id,r]));
  const completeTaskRows=rows.filter(r=>r.completion!=='not_tested'&&r.consent_confirmed==='yes');
  const consentMissing=rows.filter(r=>r.consent_confirmed!=='yes').length;
  const taskRows=TASKS.R.concat(TASKS.C).map(task=>{
    const records=rows.filter(r=>r.task_id===task);
    const completed=records.filter(r=>r.completion==='yes');
    const unassisted=completed.filter(r=>r.help_requests===0);
    const durations=records.filter(r=>r.completion!=='not_tested').map(r=>r.seconds_to_complete);
    return {task,rows:records.length,completed:completed.length,unassisted:unassisted.length,
      attempted:durations.length,median_seconds:median(durations),
      min_seconds:durations.length?Math.min(...durations):null,
      max_seconds:durations.length?Math.max(...durations):null};
  });
  const creators=requiredIds.filter(id=>id.startsWith('C'));
  const readers=requiredIds.filter(id=>id.startsWith('R'));
  const creatorCore=creators.filter(id=>['C2','C3','C4'].every(task=>{
    const r=byKey.get(id+'/'+task);
    return r?.completion==='yes'&&r.help_requests===0&&r.consent_confirmed==='yes';
  })).length;
  const readerComprehension=readers.filter(id=>{
    const r=byKey.get(id+'/R4');
    return r?.completion==='yes'&&r.help_requests===0&&r.model_understood==='yes'
      &&r.fictional_understood==='yes'&&r.local_draft_understood==='yes'
      &&r.consent_confirmed==='yes';
  }).length;
  const comparisons=rows.filter(r=>r.task_id==='R3'&&r.completion!=='not_tested');
  const counted=(key,value)=>comparisons.filter(r=>r[key]===value).length;
  const order={baseline_first:counted('condition_first','baseline'),diverse_first:counted('condition_first','diverse')};
  const preference={baseline:counted('list_preference','baseline'),diverse:counted('list_preference','diverse'),neither:counted('list_preference','neither')};
  const critical=rows.filter(r=>r.privacy_or_rights_issue==='critical'||r.severity==='P0').length;
  const significant=rows.filter(r=>r.privacy_or_rights_issue==='significant').length;
  const missingRows=requiredIds.flatMap(id=>TASKS[id[0]].map(task=>byKey.has(id+'/'+task)?null:id+'/'+task)).filter(Boolean);
  const comprehensionUnscored=rows.filter(r=>r.task_id==='R4'&&
    ['model_understood','fictional_understood','local_draft_understood'].some(field=>r[field]==='not_tested')).length;
  const unfinished=missingRows.length>0||consentMissing>0||rows.some(r=>r.completion==='not_tested')
    ||comprehensionUnscored>0;
  const balanced=order.baseline_first===5&&order.diverse_first===5;
  const thresholdMet=creatorCore>=8&&readerComprehension>=8&&balanced&&critical===0;
  const status=critical>0?'FAIL':unfinished?'INCOMPLETE':thresholdMet?'PASS':'FAIL';
  return {
    status,source:'Facilitator-entered structured observations; not independently verified by this tool',
    release_sha:releaseSha,
    sample:{readers:rows.filter(r=>r.participant_id[0]==='R').map(r=>r.participant_id).filter((v,i,a)=>a.indexOf(v)===i).length,
      creators:rows.filter(r=>r.participant_id[0]==='C').map(r=>r.participant_id).filter((v,i,a)=>a.indexOf(v)===i).length,
      total_task_rows:rows.length,expected_task_rows:100,missing_task_rows:missingRows.length,
      completed_or_failed_tasks:completeTaskRows.length,consent_unconfirmed_rows:consentMissing},
    core_creator_task_success:{count:creatorCore,denominator:10,threshold:8,
      definition:'C2, C3 and C4 all completed unassisted with consent, on the same browser'},
    reader_comprehension:{count:readerComprehension,denominator:10,threshold:8,
      definition:'R4 correctly explains ranking, fictional samples and local-only drafts without assistance'},
    comparison_order:order,comparison_preference:preference,balanced_order:balanced,
    recorded_critical_rights_or_privacy_events:critical,
    recorded_significant_rights_or_privacy_events:significant,
    tasks:taskRows,
    interpretation:status==='PASS'
      ?'Formative task thresholds met for this studied group only; no population or ranking-quality inference'
      :status==='INCOMPLETE'?'Human evidence incomplete: do not claim thresholds met'
      :'Stop and review failed thresholds or critical participant safety outcomes before public impact claims',
    limitations:['Study IDs are pseudonyms and do not certify actual recruitment, consent or task observation.',
      'Relevance nDCG@8 requires separate blinded two-reviewer judgments using the existing discovery benchmark.',
      'No raw participant observations, identifiable data or provider recordings are stored or printed by this tool.']
  };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2),get=key=>{const index=args.indexOf(key);return index<0?null:args[index+1]};
    const file=get('--input'),sha=get('--release-sha');
    assert.ok(file&&sha,'Usage: node scripts/research/score-phase2-study.mjs --input /private/phase2.csv --release-sha <commit>');
    const data=summarizeStudy(parseStudyCsv(readFileSync(resolve(file),'utf8')),sha);
    process.stdout.write(JSON.stringify(data,null,2)+'\n');
    if(data.status!=='PASS')process.exitCode=2;
  }catch(error){
    console.error('Invalid study input: '+(error instanceof Error?error.message:'unknown error'));
    process.exitCode=1;
  }
}
