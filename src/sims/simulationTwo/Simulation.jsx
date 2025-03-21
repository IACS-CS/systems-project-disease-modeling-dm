import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500;
let maxSize = 1000;

const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.newlyInfected) {
      return "🤧";
    } else if (p.infected) {
      return "🤢";
    } else if (p.dead) {
      return "💀";
    } else {
      return "😀";
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${(p.y / 100) * boxSize}px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20); // Initial population size
  const [population, setPopulation] = useState(createPopulation(popSize * popSize));
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(defaultSimulationParameters);

  useEffect(() => {
    const newPopulation = createPopulation(popSize * popSize);
    setPopulation(newPopulation);
    setDiseaseData([]);
  }, [popSize]); // Re-run when population size changes

  useEffect(() => {
    if (autoMode) {
      const timeout = setTimeout(() => {
        runTurn();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [autoMode, population]);

  const runTurn = () => {
    let newPopulation = updatePopulation([...population], simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  const resetSimulation = () => {
    const newPopulation = createPopulation(popSize * popSize);
    setPopulation(newPopulation);
    setDiseaseData([]);
  };

  const handleSliderChange = (param, value) => {
    setSimulationParameters((prevParams) => ({
      ...prevParams,
      [param]: value,
    }));
  };

  return (
    <div>
      <section className="top">
        <h1>Covid-19 Simulation</h1>
        <p>Adjust parameters and observe the spread of covid-19 in a population.</p>
        <p>
          Population: {population.length}. Infected: {population.filter((p) => p.infected).length}. Deaths: {population.filter((p) => p.dead).length}
        </p>
        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>
      </section>

      <section className="simulation-parameters">
        <h2>Simulation Parameters</h2>
        <div className="parameter-slider">
          <label>
            Population Size: {popSize}
            <input
              type="range"
              min="1"
              max="50"
              value={popSize}
              onChange={(e) => setPopSize(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="parameter-slider">
          <label>
            Infection Chance: {simulationParameters.infectionChance}%
            <input
              type="range"
              min="0"
              max="100"
              value={simulationParameters.infectionChance}
              onChange={(e) => handleSliderChange("infectionChance", e.target.value)}
            />
          </label>
        </div>
        <div className="parameter-slider">
          <label>
            Asymptomatic Rate: {simulationParameters.asymptomaticRate}%
            <input
              type="range"
              min="0"
              max="100"
              value={simulationParameters.asymptomaticRate}
              onChange={(e) => handleSliderChange("asymptomaticRate", e.target.value)}
            />
          </label>
        </div>
        <div className="parameter-slider">
          <label>
            Recovery Time: {simulationParameters.recoveryTime} days
            <input
              type="range"
              min="1"
              max="30"
              value={simulationParameters.recoveryTime}
              onChange={(e) => handleSliderChange("recoveryTime", e.target.value)}
            />
          </label>
        </div>
        <div className="parameter-slider">
          <label>
            Death Rate: {simulationParameters.deathRate}%
            <input
              type="range"
              min="0"
              max="100"
              value={simulationParameters.deathRate}
              onChange={(e) => handleSliderChange("deathRate", e.target.value)}
            />
          </label>
        </div>
        <div className="parameter-slider">
          <label>
            Max Proximity: {simulationParameters.maxProximity}%
            <input
              type="range"
              min="1"
              max="100"
              value={simulationParameters.maxProximity}
              onChange={(e) => handleSliderChange("maxProximity", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}
        <div className="world">
          <div className="population-box" style={{ width: boxSize, height: boxSize }}>
            {renderPatients(population)}
          </div>
        </div>
        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
