import math

def generate(use_predefined_values=0):
    # Predefined dataset for testing
    predefined_data = [
        {'P1': 2.5, 'unitsPressure': 'MPa', 'T1': 350, 'unitsTemperature': 'C', 'P2': 50, 'unitsPressure2': 'kPa', 'Mf': 0.1, 'unitsMassFlowRate': 'kg/s'},
    ]

    # Select values based on the parameter
    if use_predefined_values == 1:
        data = predefined_data[0]
    else:
        data = {
            'P1': round(math.uniform(1.0, 3.0), 3),  # 1 MPa to 3 MPa
            'unitsPressure': 'MPa',
            'T1': round(math.uniform(300, 400), 3),  # 300°C to 400°C
            'unitsTemperature': 'C',
            'P2': round(math.uniform(30, 60), 3),  # 30 kPa to 60 kPa
            'unitsPressure2': 'kPa',
            'Mf': round(math.uniform(0.05, 0.15), 3),  # 0.05 kg/s to 0.15 kg/s
            'unitsMassFlowRate': 'kg/s',
        }

    # Define a conversion factor for pressures if needed
    pressure_conversion = 1e-3 if data['unitsPressure'] == 'MPa' and data['unitsPressure2'] == 'kPa' else 1

    # Assuming specific heat capacity of water (steam) in kJ/kg·K
    cp = 4.186  # kJ/kg·K

    # Enthalpy calculations (hypothetical values as per Rankine cycle assumptions)
    h1 = cp * data['T1']  # Enthalpy at state 1 (in kJ/kg)
    h2 = h1 * (data['P2'] * pressure_conversion / data['P1']) ** 0.5  # Ideal simplification for h2

    # 1. Thermal Efficiency Calculation
    eta_thermal = 1 - (h2 / h1)  # Efficiency

    # 2. Net Work Output Calculation
    W_net = data['Mf'] * (h1 - h2)  # Net work output (in kW)

    # Structuring the return object
    return {
        'params': {
            'P1': data['P1'],
            'unitsPressure': data['unitsPressure'],
            'T1': data['T1'],
            'unitsTemperature': data['unitsTemperature'],
            'P2': data['P2'],
            'unitsPressure2': data['unitsPressure2'],
            'Mf': data['Mf'],
            'unitsMassFlowRate': data['unitsMassFlowRate'],
            'h1': round(h1, 3),
            'h2': round(h2, 3),
            'eta_thermal': round(eta_thermal * 100, 3),  # convert to percentage
        },
        'correct_answers': {
            'Efficiency': round(eta_thermal * 100, 3),
            'NetWork': round(W_net, 3),
        },
        'nDigits': 3,
        'sigfigs': 3,
    }