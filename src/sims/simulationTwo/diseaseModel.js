import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: 
 * 
 * What we are simulating:
 * 
 * What we are attempting to model from the real world:
 * 
 * What we are leaving out of our model:
 * 
 * What elements we have to add:
 * 
 * What parameters we will allow users to "tweak" to adjust the model:
 * 
 * In plain language, what our model does:
 * 
 */


// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

  // Add any parameters you want here with their initial values
  //  -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
// Default simulation parameters

// Default COVID-19 simulation parameters
export const defaultSimulationParameters = {
  infectionChance: 60, // Average probability of infection upon contact (COVID-19 is more transmissible than many diseases)
  asymptomaticRate: 30, // Percentage of population that is asymptomatic (higher in COVID-19)
  recoveryTime: 14, // Days before an infected person recovers (typically 14 days)
  deathRate: 2, // Death rate for COVID-19 (2% globally on average)
  incubationPeriod: 5, // Average incubation period before symptoms appear (COVID-19 has a 2-14 day range)
  maxProximity: 10, // Max distance at which people can interact (in percentage of grid size)
};

// Attributes tracked for data visualization
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "New Infections", value: "newlyInfected" },
  { label: "Total Deaths", value: "deaths" },
  { label: "Total Recovered", value: "recovered" },
  { label: "Total Asymptomatic", value: "asymptomatic" },
];

// Initialize the population
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);

  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate
      infected: false,
      daysInfected: 0,
      recovered: false,
      dead: false,
      asymptomatic: Math.random() * 100 < defaultSimulationParameters.asymptomaticRate, // Asymptomatic rate
      incubationPeriod: Math.floor(Math.random() * 5) + 5, // Incubation period (5-9 days)
    });
  }

  // Infect patient zero
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

// Function to handle infection
const maybeInfectPerson = (person, params) => {
  if (Math.random() * 100 < params.infectionChance) {
    if (!person.infected && !person.recovered && !person.dead) {
      person.infected = true;
      person.newlyInfected = true;
      person.daysInfected = 0;
      person.incubationPeriod = Math.floor(Math.random() * 5) + params.incubationPeriod; // Reset incubation period
    }
  }
};

// Calculate distance between two individuals
const calculateDistance = (personA, personB) => {
  return Math.sqrt(Math.pow(personA.x - personB.x, 2) + Math.pow(personA.y - personB.y, 2));
};

// Update the population each round
export const updatePopulation = (population, params) => {
  // Reset new infection flags
  for (let p of population) {
    p.newlyInfected = false;
  }

  const shuffledPopulation = shufflePopulation(population);

  // Simulate interactions and infections based on proximity
  for (let i = 0; i < shuffledPopulation.length - 1; i++) {
    let personA = shuffledPopulation[i];

    for (let j = i + 1; j < shuffledPopulation.length; j++) {
      let personB = shuffledPopulation[j];
      const distance = calculateDistance(personA, personB);

      // Only consider infection if they are close enough
      if (distance < params.maxProximity) {
        // Check for infection spread
        if (personA.infected && !personB.infected && personA.daysInfected >= personA.incubationPeriod) {
          maybeInfectPerson(personB, params);
        }
        if (personB.infected && !personA.infected && personB.daysInfected >= personB.incubationPeriod) {
          maybeInfectPerson(personA, params);
        }
      }
    }
  }

  // Track disease progression (recovery or death)
  for (let p of population) {
    if (p.infected) {
      p.daysInfected++;

      // If infected for the specified recovery time, either recover or die
      if (p.daysInfected >= params.recoveryTime) {
        if (Math.random() * 100 < params.deathRate) {
          p.dead = true;
        } else {
          p.recovered = true;
        }
        p.infected = false;
      }
    }
  }

  return population;
};

// Compute statistics for the current round
export const computeStatistics = (population, round) => {
  let infected = 0;
  let newlyInfected = 0;
  let deaths = 0;
  let recovered = 0;
  let asymptomatic = 0;

  for (let p of population) {
    if (p.infected) infected++;
    if (p.newlyInfected) newlyInfected++;
    if (p.dead) deaths++;
    if (p.recovered) recovered++;
    if (p.asymptomatic) asymptomatic++;
  }

  return { round, infected, newlyInfected, deaths, recovered, asymptomatic };
};

// Start the simulation
export const startSimulation = (population) => {
  let round = 0;

  // Set an interval to update the population and calculate statistics periodically
  const interval = setInterval(() => {
    round++;

    // Update population for each round
    population = updatePopulation(population, defaultSimulationParameters);

    // Compute current statistics
    const stats = computeStatistics(population, round);

    // Log stats or display them in your UI
    console.log(`Round: ${round}`, stats);

    // Optionally, stop the simulation after a certain condition (e.g., no more infections)
    if (stats.infected === 0) {
      console.log('Simulation ended, no more infections.');
      clearInterval(interval);
    }
  }, 1000); // Update every second (1000ms)
};

// Example usage:
const population = createPopulation();
startSimulation(population);
