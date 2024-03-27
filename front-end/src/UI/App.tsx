import './App.css';
import { FileDrag } from './sections/FileDrag';
import { Hero } from "./sections/Hero";
import { CopyrightFooter } from './sections/CopyrightFooter';

function App() {
  return (
    <>
      <Hero/>
      <FileDrag/>
      <CopyrightFooter/>
    </>
  )
}

export default App
