import math

def generate(use_predefined_values=False):
    g = 9.81
    mass1 = 1.6
    mass2 = 2.0
    angle = 20
    friction_static = 0.8
    friction_kinetic = 0.5

    if not use_predefined_values:
        import random
        mass1 = random.uniform(1.0, 10.0)
        mass2 = random.uniform(1.0, 10.0)
        angle = random.uniform(1.0, 45.0)

    theta_rad = math.radians(angle)
    N = mass1 * g * math.cos(theta_rad)
    Fs_max = friction_static * N
    Fk = friction_kinetic * N
    component_force = mass2 * g - mass1 * g * math.sin(theta_rad)
    a = 0

    if component_force > Fs_max:
        a = (component_force - Fk) / (mass1 + mass2)

    return {
        'params': {'mass1': mass1, 'mass2': mass2, 'angle': angle},
        'correct_answers': {'acceleration': round(a, 2)}
    }
