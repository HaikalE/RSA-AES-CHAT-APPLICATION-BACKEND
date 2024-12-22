import matplotlib.pyplot as plt

# Data
panjang_karakter = [500, 1770, 4900, 10000, 19552]
time_aes_key = [3.282136, 5.577761, 2.884063, 2.834896, 3.17927]  # in ms
time_message = [0.687136, 2.157136, 0.627969, 0.738854, 2.153073]  # in ms

# Convert ms to seconds
time_aes_key_sec = [t / 1000 for t in time_aes_key]
time_message_sec = [t / 1000 for t in time_message]

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(panjang_karakter, time_aes_key_sec, label="AES Key Encryption (RSA CRT)", marker='o')
plt.plot(panjang_karakter, time_message_sec, label="Message Encryption (AES)", marker='s')

# Customizing the plot
plt.title("Chart Comparison of Character Length with Execution Time (Encryption)")
plt.xlabel("Length Character")
plt.ylabel("Time (s)")
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.tight_layout()

# Show the plot
plt.show()
