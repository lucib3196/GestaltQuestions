const math = require("mathjs");

const generate = (usePredefinedValues = 0) => {
    const g = 9.81; // Acceleration due to gravity
    let mass1 = 1.6; // kg
    let mass2 = 2.0; // kg
    let angle = 20; // degrees
    const friction_static = 0.8;
    const friction_kinetic = 0.5;

    if (!usePredefinedValues) {
        mass1 = math.random(1.0, 10.0);
        mass2 = math.random(1.0, 10.0);
        angle = math.random(1.0, 45.0);
    }

    const thetaRad = math.unit(angle, 'deg').toNumber('rad');
    const N = mass1 * g * math.cos(thetaRad);
    const Fs_max = friction_static * N;
    const Fk = friction_kinetic * N;
    const componentForce = mass2 * g - mass1 * g * math.sin(thetaRad);
    let a = 0;

    if (componentForce > Fs_max) {
        a = (componentForce - Fk) / (mass1 + mass2);
    }

    return {
        params: { mass1, mass2, angle },
        correct_answers: {
            acceleration: math.round(a, 2)
        }
    };
};

module.exports = { generate };
