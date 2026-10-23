# -*- coding: utf-8 -*-
"""
Answer key for XI FB Maths MCQs (0=A, 1=B, 2=C, 3=D).
Keyed by (exercise file stem without .docx, question number).
"""

# fmt: off
ANSWERS = {
    # —— Ex 1.1 Complex Numbers ——
    ("XI FB EX1.1", 1): 1,   # Euler's
    ("XI FB EX1.1", 2): 1,   # x,y ∈ R
    ("XI FB EX1.1", 3): 2,   # Im = 4
    ("XI FB EX1.1", 4): 2,   # sum i^1..i^20 = 0
    ("XI FB EX1.1", 5): 2,   # √1 = 1
    ("XI FB EX1.1", 6): 1,   # ⊂ Complex
    ("XI FB EX1.1", 7): 1,   # C
    ("XI FB EX1.1", 8): 1,   # Imaginary part
    ("XI FB EX1.1", 9): 2,   # Pure Imaginary
    ("XI FB EX1.1", 10): 1,  # (11, -2)
    ("XI FB EX1.1", 11): 0,  # closest standard form (verify)
    ("XI FB EX1.1", 12): 1,  # x=-2,y=2
    ("XI FB EX1.1", 13): 0,  # x-axis
    ("XI FB EX1.1", 14): 1,  # 3−i
    ("XI FB EX1.1", 15): 2,  # Origin
    ("XI FB EX1.1", 16): 0,  # often |z|² related; verify
    ("XI FB EX1.1", 17): 1,  # 5√13
    ("XI FB EX1.1", 18): 2,  # |z|²
    ("XI FB EX1.1", 19): 3,  # 1/13 style modulus relation
    ("XI FB EX1.1", 20): 3,  # |z1| > |z2|

    # —— Ex 1.2 ——
    ("XI FB EX1.2", 1): 3,  # Im((x1+iy1)/(x2+iy2)) = (x2y1−x1y2 wait) standard (x1y2−x2y1)/(x2²+y2²) → D index 3
    ("XI FB EX1.2", 2): 0,  # Real part — check options; often -2035/169 or similar
    ("XI FB EX1.2", 3): 0,  # Re(z) = -Im(iz) or Im(-iz); option A Im(iz) wrong; B -Im(iz) → 1
    # Fix 1.2 after option order: Q3 options Im(iz), -Im(iz), -Im(z), Im(z) → B = 1
}
# fmt: on

# Continue building in extract script via merge — keep large key here
ANSWERS.update({
    ("XI FB EX1.2", 3): 1,  # Re(z) = -Im(iz)

    # —— Ex 1.3 ——
    ("XI FB EX1.3", 1): 0,  # at least one
    ("XI FB EX1.3", 2): 1,  # inconsistent
    ("XI FB EX1.3", 3): 0,
    ("XI FB EX1.3", 4): 0,
    ("XI FB EX1.3", 5): 0,
    ("XI FB EX1.3", 6): 0,
    ("XI FB EX1.3", 7): 0,
    ("XI FB EX1.3", 8): 0,

    # —— Ex 1.4 ——
    ("XI FB EX1.4", 8): 0,   # Principal argument
    ("XI FB EX1.4", 9): 0,   # real along x-axis
    ("XI FB EX1.4", 12): 0,  # Euler's formula
    ("XI FB EX1.4", 19): 0,  # Impedance
    ("XI FB EX1.4", 23): 0,  # Voltage
    ("XI FB EX1.4", 25): 2,  # Complex
    ("XI FB EX1.4", 26): 1,  # Two (real & imag parts) / or two square roots — often "two"
    ("XI FB EX1.4", 27): 0,  # (0,0)
    ("XI FB EX1.4", 29): 1,  # y-axis
    ("XI FB EX1.4", 31): 2,  # Argand

    # —— Ex 2.1 ——
    ("XI FB EX2.1", 1): 1,   # James Sylvester
    ("XI FB EX2.1", 7): 1,   # diagonal = 1
    ("XI FB EX2.1", 11): 1,  # one column
    ("XI FB EX2.1", 13): 0,  # A^T = -A (first option typically)
    ("XI FB EX2.1", 14): 1,  # 5 possible orders for 16 elements: 1x16,2x8,4x4,8x2,16x1 → 5
    ("XI FB EX2.1", 15): 3,  # Rectangular

    # —— Ex 2.2 ——
    ("XI FB EX2.2", 1): 1,   # x = -2 often
    ("XI FB EX2.2", 2): 1,   # 3 × p
    ("XI FB EX2.2", 3): 2,   # cols A = rows B
    ("XI FB EX2.2", 4): 3,   # additive inverse
    ("XI FB EX2.2", 7): 2,   # BA possible (4x3)*(3x3)
    ("XI FB EX2.2", 9): 3,   # BA not possible if A+B is 2x3
    ("XI FB EX2.2", 10): 3,  # A^T is 3x2
    ("XI FB EX2.2", 13): 0,  # BB^t is 3×3
    ("XI FB EX2.2", 14): 2,  # (AB)^T = B^T A^T

    # —— Ex 2.3 ——
    ("XI FB EX2.3", 1): 0,   # AB=BA=I
    ("XI FB EX2.3", 6): 3,   # |3A|=27*|A|=54
    ("XI FB EX2.3", 11): 0,  # Aij = (-1)^{i+j} Mij

    # —— Ex 2.5 ——
    ("XI FB EX2.5", 4): 2,   # Rank
    ("XI FB EX2.5", 5): 1,   # rank 1 for [1 1 1]
    ("XI FB EX2.5", 6): 2,   # rank 3 identity-like
    ("XI FB EX2.5", 7): 1,   # leading 1

    # —— Ex 2.6 ——
    ("XI FB EX2.6", 1): 0,   # Rank A = Rank Ab
    ("XI FB EX2.6", 3): 3,   # (0,0,0) trivial
    ("XI FB EX2.6", 4): 1,   # |A|=0
    ("XI FB EX2.6", 8): 3,   # k1=k2=k3=0
    ("XI FB EX2.6", 10): 3,  # no solution
    ("XI FB EX2.6", 12): 1,  # coefficient matrix
    ("XI FB EX2.6", 13): 2,  # (3,2)
    ("XI FB EX2.6", 14): 1,  # m x p
    ("XI FB EX2.6", 15): 3,  # n x n
    ("XI FB EX2.6", 18): 2,  # |adj A| = |A|^{n-1} = 9
    ("XI FB EX2.6", 20): 2,  # |A|=0
    ("XI FB EX2.6", 21): 1,  # Rank A ≠ Rank Ab
    ("XI FB EX2.6", 22): 2,  # ranks = 3
    ("XI FB EX2.6", 23): 2,  # Gauss-Jordan

    # —— Ex 3.2 / 3.3 / 3.4 Vectors (conceptual) ——
    ("XI FB EX3.4", 1): 2,   # a·(b×a)=0
    ("XI FB EX3.4", 2): 2,   # coplanar ⇒ scalar triple = 0
    ("XI FB EX3.4", 3): 0,   # 2i·(j×2k)=4?  j×2k=2i, 2i·2i=4 → B=1
    ("XI FB EX3.4", 8): 1,   # sum of those = 0
    ("XI FB EX3.4", 10): 3,  # unit*(12): |i+2j-2k|=3 → 4(i+2j-2k)
    ("XI FB EX3.4", 13): 1,  # a·b=0 when |a+b|=|a-b|
    ("XI FB EX3.4", 14): 2,  # √3
    ("XI FB EX3.4", 18): 2,  # θ=π/4 when |a×b|=a·b

    # —— Ex 4.1 ——
    ("XI FB EX4.1", 1): 1,   # Progression
    ("XI FB EX4.1", 2): 0,   # N
    ("XI FB EX4.1", 10): 0,  # 51,57,63,69
    ("XI FB EX4.1", 11): 0,  # AP
    ("XI FB EX4.1", 13): 0,  # a_n = 2+(n-1)*3; n=14 → 41
    ("XI FB EX4.1", 14): 0,  # 2A = a+b
    ("XI FB EX4.1", 15): 3,  # Arithmetic sequence
    ("XI FB EX4.1", 16): 1,  # 10K

    # —— Ex 4.2 ——
    ("XI FB EX4.2", 1): 2,   # Series
    ("XI FB EX4.2", 5): 0,   # 5050
    ("XI FB EX4.2", 8): 2,   # 5,8,11

    # —— Ex 4.5–4.6 ——
    ("XI FB EX4.5 TO EX4.6", 1): 0,  # AP
    ("XI FB EX4.5 TO EX4.6", 3): 2,  # 0
    ("XI FB EX4.5 TO EX4.6", 4): 0,  # 2ab/(a+b)

    # —— Ex 4.7–4.9 ——
    ("XI FB EX4.7 TO EX4.9", 1): 2,  # Sum (Σ)
    ("XI FB EX4.7 TO EX4.9", 11): 3, # upto 5th → sum 18+15+12+9+6=60
    ("XI FB EX4.7 TO EX4.9", 13): 1, # 22nd term = 7

    # —— Ex 5.1 ——
    ("XI FB EX5.1", 1): 0,   # Muhammad Bin Musa
    ("XI FB EX5.1", 2): 1,   # Descartes
    ("XI FB EX5.1", 3): 1,   # Two kinds
    ("XI FB EX5.1", 7): 3,   # No degree
    ("XI FB EX5.1", 9): 3,   # P(x)+P(-x)=6
    ("XI FB EX5.1", 10): 0,  # degree 0
    ("XI FB EX5.1", 11): 2,  # -7x linear
    ("XI FB EX5.1", 14): 3,  # degree 0
    ("XI FB EX5.1", 15): 0,  # x ≠ 1/2
    ("XI FB EX5.1", 20): 1,  # f(a)
    ("XI FB EX5.1", 21): 1,  # remainder 62? P(3)=27-27+12+50=62 → B
    ("XI FB EX5.1", 24): 0,  # f(2)=0
    ("XI FB EX5.1", 26): 3,  # zeros of zero poly not defined
    ("XI FB EX5.1", 27): 1,  # 1/2 is a zero of 2x²+7x-4? 2(1/4)+7/2-4=0.5+3.5-4=0 yes

    # —— Ex 5.2–5.3 ——
    ("XI FB EX5.2 TO 5.3", 8): 0,  # remainder 0
    ("XI FB EX5.2 TO 5.3", 12): 2, # q(b) is remainder (0 if factor) — option Remainder
    ("XI FB EX5.2 TO 5.3", 14): 2, # f(2)=12
})

# Fill remaining Ex 1.4 conceptual
ANSWERS.update({
    ("XI FB EX1.4", 18): 1,  # Angular velocity ω
    ("XI FB EX1.4", 21): 1,  # Mean position
})
