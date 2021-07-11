# Spherical harmonic transform hash

This document specifies a spherical harmonic transform (SHT) hash, which is
intended to be a compact method of encoding a spherical panorama preview. It is
based on the [BlurHash specification](https://github.com/woltapp/blurhash/blob/master/Algorithm.md)
for DCT-based 2D image previews.

There are three steps for creating a SHT hash:

1. Calculate real spherical harmonic transform coefficients
2. Encode with compact binary encoding
3. Encode binary data as Base-83-encoded string

Spherical harmonics form an orthogonal basis for representing a function on the
sphere. Combined with coefficients for each harmonic, they can be used to
represent a frequency-space approximation of such a function, without boundary
effects. There are multiple normalization conventions for spherical harmonics;
the $4\pi$ convention is used here. Since JavaScript does not natively support
complex numbers, real harmonics with separate real sine and cosine coefficients
are used.

Spherical harmonics, $Y_{\ell m}$, are defined for $\ell \in \mathbb{Z}^+$,
with $|m| \leq \ell$. For each $Y_{\ell m}$, there is a corresponding
$f_{\ell m}$ coefficient. When these coefficients are represented in a pair of
matrices (one for the sine coefficient and one for the cosine coefficients)
with rows indexed by $\ell$ and columns indexed by $m$, the upper triangle of
the matrix is zero. Additionally, the $\ell = m = 1$ coefficient in the sine
matrix is always 1 in the $4\pi$ normalization convention, which is why it is
used here. Spherical harmonic coefficients are calculated separately for each
color channel. Once calculated, the sine and cosine coefficients are stored in
1D arrays using row-first ordering with the upper triangle of the matrices
excluded. The coefficient arrays also excludes the first row and column of
the coefficient matrices since their contents are always zero, except for the
$\ell = m = 1$ sine coefficient, which is always 1 (as previously mentioned).
The 1D cosine coefficient array is appended to the 1D sine coefficient array,
for each of the color channels.

The maximum coefficient magnitude is then found across the color channels, and
this value is used to normalize the coefficients in the range $[-1, 1]$. The
normalized coefficients are then multiplied by 9 and converted to integers,
thereby quantizing the coefficients as integer values. These signed integers in
the range $[-9, 9]$ are then converted to unsigned integers in the range
$[0, 18]$ by adding 9. For each coefficient, the color channel values are
packed into a single number in the range $[0, 6859]$ using
$R \cdot 19^2 + G \cdot 19 + B$. This number is then Base-83-encoded into a
pair of characters. Color is encoded and decoded using gamma-compressed sRGB
values, for simplicity.

The final SHT hash string is constructed by combining the Base-83-encoded
coefficients with a prefix. The first character in the prefix contains the max
$\ell$ value for the coefficients, encoded as Base 83. For Pannellum, this is
currently fixed at $\ell = 5$. The next character contains the maximum
coefficient value, which was used in the normalization. The value is divided by
255 to normalize it to the range $[0, 1]$. This value is then multiplied by 82
and quantized as an integer, before being Base-83 encoded. For $\ell = 5$ this
string is 74 characters in length.


## Base 83

A custom Base-83 encoding is used. Values are encoded individually, using one
or two digits, and concatenated together. Multiple-digit values are encoded in
big-endian order, with the most-significant digit first.

The character set used is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~`.
