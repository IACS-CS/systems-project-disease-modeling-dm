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
export const defaultSimulationParameters = {
  infectionChance: 50, // Probability of infection upon contact
  asymptomaticRate: 20, // Percentage of population that is asymptomatic
  recoveryTime: 5, // Days before an infected person recovers
  deathRate: 4, // Percentage of infected individuals who die instead of recovering
};

// Attributes tracked for data visualization
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "New Infections", value: "newlyInfected" },
  { label: "Total Deaths", value: "deaths" },
  { label: "Total Recovered", value: "recovered" },
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
      asymptomatic: Math.random() * 100 < defaultSimulationParameters.asymptomaticRate,
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
    }
  }
};

// Update the population each round
export const updatePopulation = (population, params) => {
  for (let p of population) {
    p.newlyInfected = false;
  }

  const shuffledPopulation = shufflePopulation(population);

  for (let i = 0; i < shuffledPopulation.length - 1; i += 2) {
    let personA = shuffledPopulation[i];
    let personB = shuffledPopulation[i + 1];

    // Adjust movement and interactions
    personA.x += Math.random() < 0.5 ? -1 : 1;
    personB.x = personA.x + 2;
    personB.y = personA.y;

    // Check for infection spread
    if (personA.infected && !personB.infected) {
      maybeInfectPerson(personB, params);
    }
    if (personB.infected && !personA.infected) {
      maybeInfectPerson(personA, params);
    }
  }

  // Track disease progression (recovery or death)
  for (let p of population) {
    if (p.infected) {
      p.daysInfected++;
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

  for (let p of population) {
    if (p.infected) infected++;
    if (p.newlyInfected) newlyInfected++;
    if (p.dead) deaths++;
    if (p.recovered) recovered++;
  }

  return { round, infected, newlyInfected, deaths, recovered };
};