import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, let's consider a simple disease that spreads through contact.
You can implement a simple model which does one of the following:

1. Model the different effects of different numbers of contacts: in my Handshake Model, two people are in 
   contact each round. What happens if you put three people in contact? Four? Five? Consider different options
   such as always putting people in contact with the people "next" to them (i.e. the people before or after them
   in line) or randomly selecting people to be in contact (just do one of these for your model).

2. Take the "handshake" simulation code as your model, but make it so you can recover from the disease. How does the
spread of the disease change when you set people to recover after a set number of days.

3. Add a "quarantine" percentage to the handshake model: if a person is infected, they have a chance of being quarantined
and not interacting with others in each round.

*/

/**
 * Authors: Dev Patel
 
 * What we are simulating: 
  * This simulation models the spread of a disease with recovery.

 
 * What elements we have to add: 
  * - Recovery time: Infected individuals recover after a set number of rounds.
 * - Variable number of contacts: People interact with others each round.
 * - Customizable infection chance: Adjust the probability of infection.
 
 
* In plain language, what our model does:
  * This model simulates disease spread in a population where people can become infected, interact with others, and recover after a set time.

 */




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
  infectionChance: 50,
  recoveryChance: 5, // Chance of recovery per round
};

// List of attributes we show on data table / graph
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Recovered", value: "recovered" },
];

// Create the population with default attributes
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      recovered: false, // Tracks if the person has recovered
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

// Function to potentially infect a person
const maybeInfectPerson = (person, params) => {
  if (Math.random() * 100 < params.infectionChance && !person.infected && !person.recovered) {
    person.infected = true;
  }
};

// Function to potentially recover a person
const maybeRecoverPerson = (person, params) => {
  if (Math.random() * 100 < params.recoveryChance && person.infected) {
    person.infected = false;
    person.recovered = true;
  }
};

// Update the population each round
export const updatePopulation = (population, params) => {
  const shuffledPopulation = shufflePopulation(population);

  // Pair up individuals for interaction
  for (let i = 0; i < shuffledPopulation.length - 1; i += 2) {
    let personA = shuffledPopulation[i];
    let personB = shuffledPopulation[i + 1];

    // Adjust positioning to simulate movement
    if (personA.x < 1) personA.x += Math.ceil(Math.random() * 5);
    if (personA.x > 99) personA.x -= Math.ceil(Math.random() * 5);
    personA.x -= 1;
    personB.x = personA.x + 2;
    personB.y = personA.y;

    // Track partners for future interactions
    personA.partner = personB;
    personB.partner = personA;

    // Check if they infect each other
    if (personA.infected && !personB.infected) maybeInfectPerson(personB, params);
    if (personB.infected && !personA.infected) maybeInfectPerson(personA, params);
  }

  // Attempt recovery for all infected individuals
  for (let p of population) {
    if (p.infected) maybeRecoverPerson(p, params);
  }

  return population;
};

/**
 * Computes statistics for the current round of the simulation.
 *
 * @param {Array} population - The array representing the population.
 * @param {number} round - The current round number.
 * @returns {Object} Statistics including total infected and recovered individuals.
 */
export const computeStatistics = (population, round) => {
  let infected = 0;
  let recovered = 0;

  for (let p of population) {
    if (p.infected) infected++;
    if (p.recovered) recovered++;
  }

  return { round, infected, recovered };
};