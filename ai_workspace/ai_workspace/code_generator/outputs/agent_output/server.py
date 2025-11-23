import math

def generate(use_predefined_values=0):
    # Predefined dataset for testing purposes
    predefined_data = [
        {'thickness_brick': 0.2, 'k_brick': 0.72, 'thickness_insulation': 0.1, 'k_insulation': 0.04, 'thickness_concrete': 0.15, 'k_concrete': 1.7, 'T1': 20, 'T2': -10},
        {'thickness_brick': 0.25, 'k_brick': 0.9, 'thickness_insulation': 0.2, 'k_insulation': 0.03, 'thickness_concrete': 0.1, 'k_concrete': 1.5, 'T1': 25, 'T2': -5},
        {'thickness_brick': 0.15, 'k_brick': 0.6, 'thickness_insulation': 0.15, 'k_insulation': 0.05, 'thickness_concrete': 0.2, 'k_concrete': 1.2, 'T1': 30, 'T2': 10},
        {'thickness_brick': 0.2, 'k_brick': 0.85, 'thickness_insulation': 0.1, 'k_insulation': 0.04, 'thickness_concrete': 0.1, 'k_concrete': 1.8, 'T1': 15, 'T2': 0},
        {'thickness_brick': 0.3, 'k_brick': 0.75, 'thickness_insulation': 0.2, 'k_insulation': 0.035, 'thickness_concrete': 0.15, 'k_concrete': 1.9, 'T1': 22, 'T2': 5},
    ]

    if use_predefined_values == 0:
        import random
        # Generate random values within realistic ranges
        thickness_brick = random.uniform(0.1, 0.3)  # m
        k_brick = random.uniform(0.5, 1.0)  # W/(m·K)
        thickness_insulation = random.uniform(0.1, 0.3)  # m
        k_insulation = random.uniform(0.03, 0.1)  # W/(m·K)
        thickness_concrete = random.uniform(0.1, 0.3)  # m
        k_concrete = random.uniform(1.0, 2.0)  # W/(m·K)
        T1 = random.uniform(0, 100)  # °C
        T2 = random.uniform(-20, 20)  # °C
    else:
        # Use predefined values
        data = random.choice(predefined_data)
        thickness_brick = data['thickness_brick']
        k_brick = data['k_brick']
        thickness_insulation = data['thickness_insulation']
        k_insulation = data['k_insulation']
        thickness_concrete = data['thickness_concrete']
        k_concrete = data['k_concrete']
        T1 = data['T1']
        T2 = data['T2']

    # Calculate thermal resistances for each layer
    A = 1  # Assume area = 1 m² for simplicity
    R_brick = thickness_brick / (k_brick * A)  # R for brick layer
    R_insulation = thickness_insulation / (k_insulation * A)  # R for insulation layer
    R_concrete = thickness_concrete / (k_concrete * A)  # R for concrete layer

    # Total thermal resistance
    R_total = R_brick + R_insulation + R_concrete

    # Calculate heat transfer rate
    Q = (T1 - T2) / R_total

    return {
        'params': {
            'thickness_brick': round(thickness_brick, 3),
            'k_brick': round(k_brick, 3),
            'thickness_insulation': round(thickness_insulation, 3),
            'k_insulation': round(k_insulation, 3),
            'thickness_concrete': round(thickness_concrete, 3),
            'k_concrete': round(k_concrete, 3),
            'T1': round(T1, 3),
            'T2': round(T2, 3),
            'R_total': round(R_total, 3),
            'heat_transfer_rate': round(Q, 3),
        },
        'correct_answers': {
            'heat_transfer_rate': round(Q, 3),
        },
        'nDigits': 3,
        'sigfigs': 3,
    }