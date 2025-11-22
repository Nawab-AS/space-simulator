const objectTypes = {
    "Star": {
        radius: {
            min: 0.1,
            max: 1.5
        },
        mass: {
            min: 0.08,
            max: 50
        },
        luminosity: {
            min: 0,
            max: 100
        }
    },
    "Planet": {
        radius: {
            min: 0.05,
            max: 0.1
        },
        mass: {
            min: 3e-6,
            max: 1e-3
        }
    }
};


function colorOfStar(mass, radius, luminosity) {
    // Stefan-Boltzmann Law: L=oAT^4   where 'o' is the Stefan-Boltzmann constant (assuming star is a black body)
    // L = o * A * T^4    Solve for T
    // T^4 = L / (o * A)
    // T = [L / (o * A)]^0.25
    // T = [L / (4pi * o * radius^2)]^0.25    (A = 4 * pi * r^2)
}