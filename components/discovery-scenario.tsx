'use client';
import {getDiscovery} from '../lib/discovery';
import {DISCOVERY_SCENARIO_STORIES,SCENARIO_CATEGORY_COUNT} from '../lib/discovery-scenario';
import styles from './discovery-scenario.module.css';

export function DiscoveryScenario({diversity,onDiversityChange}:{diversity:number;onDiversityChange:(value:number)=>void}){
  const result=getDiscovery(DISCOVERY_SCENARIO_STORIES,{
    query:'',interest:'All categories',diversity,savedOnly:false,saved:[]
  });
  const limit=result.windowSize;
  return <section className={styles.scenario} aria-labelledby="uneven-demo-title">
    <div className={styles.heading}>
      <div>
        <p className={styles.eyebrow}>Transparent ranking demonstration</p>
        <h3 id="uneven-demo-title">When one category dominates the feed</h3>
        <p>Separate from the eight main stories, these 12 invented examples contain eight Technology stories and one in each of four other categories. Both lists use exactly the same examples.</p>
      </div>
      <label className={styles.slider} htmlFor="uneven-demo-weight">
        <span>Demo diversity weight <output htmlFor="uneven-demo-weight">{diversity}%</output></span>
        <input id="uneven-demo-weight" type="range" min="0" max="100" step="10"
          value={diversity} onChange={event=>onDiversityChange(Number(event.target.value))}/>
        <small>0% follows the relevance-only baseline; higher values favor less-represented categories.</small>
      </label>
    </div>
    <div className={styles.results}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}><h4>Relevance-only baseline</h4>
          <p><strong>{result.baselineCoverage} / {SCENARIO_CATEGORY_COUNT}</strong> represented categories in the first {limit}</p></div>
        <ol>{result.baseline.slice(0,limit).map((story,i)=><li key={story.id}>
          <span className={styles.position}>{String(i+1).padStart(2,'0')}</span>
          <span><strong>{story.category}</strong><small>{story.title}</small></span>
        </li>)}</ol>
      </div>
      <div className={styles.panel}>
        <div className={styles.panelHeader}><h4>Diversity-aware order</h4>
          <p><strong>{result.diverseCoverage} / {SCENARIO_CATEGORY_COUNT}</strong> represented categories in the same first {limit}</p></div>
        <ol>{result.ranked.slice(0,limit).map((story,i)=><li key={story.id}>
          <span className={styles.position}>{String(i+1).padStart(2,'0')}</span>
          <span><strong>{story.category}</strong><small>{story.title}</small></span>
        </li>)}</ol>
      </div>
    </div>
    <p className={styles.caveat}>In this all-interest scenario, every item receives the same relevance score; the baseline breaks ties by title. The examples deliberately exaggerate category imbalance to make the weighting visible. These figures do not measure fairness, editorial quality, audience growth or real-world impact.</p>
  </section>;
}
