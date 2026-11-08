import type {Metadata} from 'next';
import {HomeContent} from '../../components/home-content';

export const metadata:Metadata={
  title:'Discover stories — NewWave Africa',
  description:'Discover fictional African storytelling samples and explore transparent category-diversity ranking.'
};

export default function Discover(){return <HomeContent mode="discover"/>;}
