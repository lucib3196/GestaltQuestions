const math = require("mathjs");

const generate = (usePredefinedValues = 0) => {
    const unitSystems = ['si', 'uscs'];
    const units = {
        "si": { 
            "mass": "kg",
            "pressure": "kPa",
            "temperature": "°C",
            "work": "kJ",
            "massFlowRate": "kg/s",
        },
        "uscs": {
            "mass": "lb",
            "pressure": "psi",
            "temperature": "°F",
            "work": "BTU",
            "massFlowRate": "lb/s",
        }
    };

    // Dynamic unit selection based on randomization
    const unitSel = math.randomInt(0, unitSystems.length);
    const selectedUnits = units[unitSystems[unitSel]];

    // Dynamic value generation
    let P1, T1, P2, Mf;
    if (usePredefinedValues === 0) {
        P1 = unitSel === 0 ? math.random(2500, 3000) : math.random(500, 600); // pressure
        T1 = unitSel === 0 ? math.random(340, 360) : math.random(140, 160); // temperature
        P2 = unitSel === 0 ? math.random(40, 60) : math.random(10, 12); // condenser pressure
        Mf = Math.round(math.random(0.05, 0.15) * 100) / 100; // mass flow rate
    } else {
        // If predefined values are required
        P1 = unitSel === 0 ? 2800 : 550; // Example predefined values
        T1 = unitSel === 0 ? 350 : 150;
        P2 = unitSel === 0 ? 50 : 11;
        Mf = 0.10;
    }

    // Assume values for enthalpy
    const h1 = unitSel === 0 ? 3115 : 1323; // kJ/kg or BTU/lb
    const h2 = unitSel === 0 ? 2350 : 1000; // kJ/kg or BTU/lb

    // Compute thermal efficiency and net work output
    const efficiency = 1 - (h2 / h1);
    const netWorkOutput = Mf * (h1 - h2);

    // Format results, consider appropriate conversions and rounding
    const thermalEfficiency = math.round(efficiency * 100 * 1000) / 1000; // percent
    const netWork = math.round(netWorkOutput * 10) / 10; // kW or BTU/s

    const data = {
        params: {
            P1: P1,
            T1: T1,
            P2: P2,
            Mf: Mf,
            unitsPressure: selectedUnits.pressure,
            unitsTemperature: selectedUnits.temperature,
            unitsWork: selectedUnits.work,
            unitsMassFlowRate: selectedUnits.massFlowRate,
        },
        correct_answers: {
            Efficiency: thermalEfficiency,
            NetWork: netWork,
        },
        intermediate: {}, // Optional: intermediate reasoning steps.
        nDigits: 3,
        sigfigs: 3
    };

    // Error Handling
    if (netWork < 0) {
        throw new Error("Computed net work output is negative, which is not valid.");
    }

    return data;
};

module.exports = { generate };