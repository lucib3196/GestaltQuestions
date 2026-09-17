import random, copy
from numpy.polynomial import Polynomial
import numpy.polynomial.polynomial as poly
from numpy.polynomial.polynomial import polyval
import numpy as np
from pytexit import py2tex
import sympy as sp

np.set_printoptions(legacy='1.25')

def poly_string(p, var_string='x'):
    res = ''
    first_pow = len(p) - 1
    for i, coef in enumerate(p):
        power = first_pow - i

        if coef:
            if coef < 0:
                sign, coef = (' - ' if res else '- '), -coef
            elif coef > 0: # must be true
                sign = (' + ' if res else '')

            str_coef = '' if coef == 1 and power != 0 else str(int(coef))

            if power == 0:
                str_power = ''
            elif power == 1:
                str_power = var_string
            else:
                str_power = var_string + '^' + str(power)

            res += sign + str_coef + str_power 
    return res



def generate():

    params = dict()
    correct_answers = dict()
    symbolic_subs = dict()
    nDigits = 2
    sigfigs = 2
    data = dict(params=params, correct_answers=correct_answers, symbolic_subs = symbolic_subs, nDigits=nDigits, sigfigs=sigfigs)


    choice = np.random.randint(0,4)
    match choice:
        case 0:
            x,y,z = sp.symbols('x,y,z')
        case 1:
            x,y,z = sp.symbols('a,b,c')
        case 2:
            x,y,z = sp.symbols('p,q,r') 
        case 3:
            x,y,z = sp.symbols('u,v,w')

               
    vals = {x: np.random.randint(2,4), y: np.random.randint(2,4), z: np.random.randint(2,4)}

    vals1 = {str(x): vals[x], str(y): vals[y], str(z): vals[z]}

    # x,y,z = sp.symbols('x,y,z')
    f1 = np.random.randint(-3,3)*pow(x,np.random.randint(0,3)) + np.random.randint(-3,3)*pow(y,np.random.randint(0,3)) + np.random.randint(-3,3)*pow(z,np.random.randint(0,3)) 
    f2 = np.random.randint(-3,3)*pow(x,np.random.randint(0,3)) + np.random.randint(-3,3)*pow(y,np.random.randint(0,3)) + np.random.randint(-3,3)*pow(z,np.random.randint(0,3)) 

    
    f1s = sp.latex(f1)
    f2s = sp.latex(f2)
    f3 = f1 * f2
    f3s = sp.latex(f3)
    

 


    f3v = f3.subs(vals)
    numsols = {"f3s": sp.N(f3v)}
  
    data['params']['p1s'] = f1s
    data['params']['p2s'] = f2s
    data['correct_answers']['f3s'] = f3s
    data['symbolic_subs']['vals'] = vals1
    data['symbolic_subs']['numsols']= numsols

    print(data)

    
    return data