import test from 'node:test';
import assert from 'node:assert/strict';
import {HEADER,parseStudyCsv,summarizeStudy} from '../scripts/research/score-phase2-study.mjs';

const sha='a1ae9260848f3a574866f7820a3285a03d1b2539';
const allRows=()=>{
  const rows=[];
  for(const role of ['R','C'])for(let i=1;i<=10;i++){
    const id=role+String(i).padStart(2,'0');
    for(let j=1;j<=5;j++){
      const task=role+j;
      rows.push({
        participant_id:id,task_id:task,consent_confirmed:'yes',completion:'yes',
        seconds_to_complete:'60',help_requests:'0',error_count:'0',
        privacy_or_rights_issue:'none',severity:'none',
        model_understood:task==='R4'?'yes':'',
        fictional_understood:task==='R4'?'yes':'',
        local_draft_understood:task==='R4'?'yes':'',
        condition_first:task==='R3'?(i<=5?'baseline':'diverse'):'',
        list_preference:task==='R3'?'diverse':''
      });
    }
  }
  return rows;
};
const csv=rows=>[HEADER.join(','),...rows.map(r=>HEADER.map(key=>r[key]).join(','))].join('\n')+'\n';
test('fully fictional balanced fixture reports PASS with no participant output',()=>{
  const rows=parseStudyCsv(csv(allRows()));
  const result=summarizeStudy(rows,sha);
  assert.equal(result.status,'PASS');
  assert.equal(result.sample.total_task_rows,100);
  assert.equal(result.sample.readers,10);
  assert.equal(result.sample.creators,10);
  assert.equal(result.core_creator_task_success.count,10);
  assert.equal(result.reader_comprehension.count,10);
  assert.equal(result.balanced_order,true);
  assert.equal(JSON.stringify(result).includes('participant_id'),false);
  assert.equal(JSON.stringify(result).includes('observed_behavior'),false);
});
test('empty, incomplete and declined sessions never pass',()=>{
  assert.equal(summarizeStudy([],sha).status,'INCOMPLETE');
  const rows=allRows();
  const first=rows[0];
  first.consent_confirmed='no';first.completion='not_tested';first.seconds_to_complete='';
  const result=summarizeStudy(parseStudyCsv(csv(rows)),sha);
  assert.equal(result.status,'INCOMPLETE');
  assert.equal(result.sample.consent_unconfirmed_rows,1);
  assert.equal(summarizeStudy(parseStudyCsv(csv(allRows().slice(0,99))),sha).status,'INCOMPLETE');
});
test('critical privacy issue blocks study regardless of completion percentage',()=>{
  const rows=allRows();
  rows[6].privacy_or_rights_issue='critical';rows[6].severity='P0';
  const result=summarizeStudy(parseStudyCsv(csv(rows)),sha);
  assert.equal(result.status,'FAIL');
  assert.equal(result.recorded_critical_rights_or_privacy_events,1);
});
test('creator/reader success requires every constituent task rather than averaging',()=>{
  const rows=allRows();
  for(let i=1;i<=3;i++){
    const participant='C'+String(i).padStart(2,'0');
    const r=rows.find(x=>x.participant_id===participant&&x.task_id==='C3');
    r.help_requests='1';
  }
  for(let i=1;i<=3;i++){
    const participant='R'+String(i).padStart(2,'0');
    const r=rows.find(x=>x.participant_id===participant&&x.task_id==='R4');
    r.model_understood='no';
  }
  const result=summarizeStudy(parseStudyCsv(csv(rows)),sha);
  assert.equal(result.status,'FAIL');
  assert.equal(result.core_creator_task_success.count,7);
  assert.equal(result.reader_comprehension.count,7);
});
test('comparison order must be counterbalanced',()=>{
  const rows=allRows();
  rows.find(x=>x.task_id==='R3').condition_first='diverse';
  const result=summarizeStudy(parseStudyCsv(csv(rows)),sha);
  assert.equal(result.status,'FAIL');
  assert.deepEqual(result.comparison_order,{baseline_first:4,diverse_first:6});
});
test('free-text, unsolicited fields, duplicates, invalid scores and malformed IDs are rejected',()=>{
  const rows=allRows();
  const bad=csv(rows).replace('R01,R1,','Jane Smith,R1,');
  assert.throws(()=>parseStudyCsv(bad),/anonymous R01-R10/);
  assert.throws(()=>parseStudyCsv(csv(rows).replace('R01,R1,','R01,R1,extra,')),/column count/);
  assert.throws(()=>parseStudyCsv(csv(rows).replace('60,0,0,none,none','60,0,0,"quoted",none')),/Quoted/);
  assert.throws(()=>parseStudyCsv(csv([rows[0],rows[0]])),/Duplicate/);
  rows[0].seconds_to_complete='-15';
  assert.throws(()=>parseStudyCsv(csv(rows)),/Invalid seconds_to_complete/);
});
test('unconsented attempted task is rejected',()=>{
  const rows=allRows();
  rows[0].consent_confirmed='no';
  assert.throws(()=>parseStudyCsv(csv(rows)),/Do not conduct a task without consent/);
});
test('a missing release commit cannot be scored',()=>{
  assert.throws(()=>summarizeStudy(parseStudyCsv(csv(allRows())),'latest'),/exact 40-character/);
});
