const math = require("mathjs");

const generate = (usePredefinedValues = 0) => {
    const unitSystems = ['si', 'uscs'];

    const units = {
        "si": {
            "dist": "m",
            "thermalConductivity": "W/m*K",
            "temperature": "K"
        },
        "uscs": {
            "dist": "feet",
            "thermalConductivity": "Btu/h*ft*F",
            "temperature": "°F"
        }
    };

    const unitSel = math.randomInt(0, 2);
    const unitsDist = units[unitSystems[unitSel]].dist;
    const unitsThermalConductivity = units[unitSystems[unitSel]].thermalConductivity;
    const unitsTemperature = units[unitSystems[unitSel]].temperature;

    // 1. Dynamic Values Generation
    const thickness_brick = usePredefinedValues === 0 ? math.round(math.random(10, 30) * 100) / 100 : 20; // cm
    const k_brick = usePredefinedValues === 0 ? math.random(0.5, 1.5) : 0.72; // W/m*K
    const thickness_insulation = usePredefinedValues === 0 ? math.round(math.random(5, 15) * 100) / 100 : 10; // cm
    const k_insulation = usePredefinedValues === 0 ? math.random(0.01, 0.1) : 0.04; // W/m*K
    const thickness_concrete = usePredefinedValues === 0 ? math.round(math.random(10, 25) * 100) / 100 : 15; // cm
    const k_concrete = usePredefinedValues === 0 ? math.random(1.5, 2.5) : 1.7; // W/m*K
    const T1 = usePredefinedValues === 0 ? math.random(15, 25) : 20; // °C
    const T2 = usePredefinedValues === 0 ? math.random(-20, 0) : -10; // °C

    // 2. Convert thickness from cm to m
    const thickness_brick_m = thickness_brick / 100;
    const thickness_insulation_m = thickness_insulation / 100;
    const thickness_concrete_m = thickness_concrete / 100;

    // 3. Compute thermal resistances
    const R_brick = thickness_brick_m / k_brick;
    const R_insulation = thickness_insulation_m / k_insulation;
    const R_concrete = thickness_concrete_m / k_concrete;

    // 4. Total resistance
    const R_total = R_brick + R_insulation + R_concrete;

    // 5. Rate of heat transfer calculation
    const Q = (T1 - T2) / R_total; // Using area A = 1 m^2 for simplicity

    return {
        params: {
            thickness_brick: thickness_brick,
            k_brick: k_brick,
            thickness_insulation: thickness_insulation,
            k_insulation: k_insulation,
            thickness_concrete: thickness_concrete,
            k_concrete: k_concrete,
            T1: T1,
            T2: T2,
            unitsDist: unitsDist,
            unitsThermalConductivity: unitsThermalConductivity,
            unitsTemperature: unitsTemperature
        },
        correct_answers: {
            heatTransfer: Q
        },
        nDigits: 3,
        sigfigs: 3
    };
};

module.exports = { generate };