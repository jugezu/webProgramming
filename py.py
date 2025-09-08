# rakennetaan siis full adderi joka toimii loopin sisällä

def bittisumma(a, b):
    while(b != 0):

        kantobitti=(a&b)

        a=a ^ b

        b=kantobitti << 1

        summa=a
               
    return summa

summa=bittisumma(150,31)
print(summa)