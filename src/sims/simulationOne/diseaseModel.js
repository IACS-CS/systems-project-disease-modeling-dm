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
 
 * What elements we have to add: 
 * Recovery time: Implement a way for infected individuals to recover after a set number of rounds.
 * Quarantine: Add a chance for infected individuals to be quarantined and thus not interact with others.
 * Variable number of contacts: We can change the number of people interacting each round.
 * Customizable infection chance: Adjust the infection spread probability based on user input.
 
* In plain language, what our model does:
 * In plain language, this model simulates the spread of a disease with added features like recovery, quarantine, and customizable infection probabilities. 
*/


export const defaultSimulationParameters = {
  infectionChance: 50,
  // Add any new parameters you want here with their initial values
  //  -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.
};

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */


export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      quarantined: false,
      recovered: false,
      mindControlled: false,
      infectionTime: 0,
    });
  }
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

const updateIndividual = (person, contact, params) => {
  if (person.quarantined || person.recovered) return;

  if (person.infected) {
    person.infectionTime++;

    // Mind-control phase before full transformation
    if (person.infectionTime === params.mindControlTime) {
      person.mindControlled = true;
    }

    // Recovery after set rounds
    if (person.infectionTime >= params.recoveryTime) {
      person.infected = false;
      person.recovered = true;
      person.mindControlled = false;
    }
  }

  // Spread infection if in contact with an infected person
  if (contact.infected && !person.recovered && Math.random() * 100 < params.infectionChance) {
    if (!person.infected) {
      person.infected = true;
      person.infectionTime = 0;

      // Chance to quarantine
      if (Math.random() * 100 < params.quarantineChance) {
        person.quarantined = true;
      }
    }
  }
};

export const updatePopulation = (population, params) => {
  shufflePopulation(population);
  for (let i = 0; i < population.length; i++) {
    let p = population[i];
    let contact = population[(i + 1) % population.length];
    updateIndividual(p, contact, params);
  }
  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Quarantined", value: "quarantined" },
  { label: "Total Recovered", value: "recovered" },
  { label: "Mind-Controlled", value: "mindControlled" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let quarantined = 0;
  let recovered = 0;
  let mindControlled = 0;

  for (let p of population) {
    if (p.infected) infected++;
    if (p.quarantined) quarantined++;
    if (p.recovered) recovered++;
    if (p.mindControlled) mindControlled++;
  }

  return { round, infected, quarantined, recovered, mindControlled };
};
