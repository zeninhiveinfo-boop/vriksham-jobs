# Setup Instructions for 48 GB MacBook Pro

Copy and paste the prompt below into **Antigravity** running on your 48 GB MacBook Pro.

---

```text
Please set up this Mac so that my MacBook Air can SSH into it and run background tasks.

Here are the required tasks:
1. Ensure 'Remote Login' (SSH server) is enabled on this Mac.
2. Ensure ~/.ssh directory exists with permissions 700.
3. Append the following public key to ~/.ssh/authorized_keys (if not already present) and set permissions to 600:
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKrBL2zwIbIHZY0rxjXEMlXFbjA5TZOPlbtoVLBx4upe macbook-air
4. Verify that python3, node, tesseract, and poppler (pdftotext) are installed, or install/report missing tools via Homebrew.
5. Output the Local IP address and current Username of this Mac so I can pass it back to my agent.
```

---

## After Running

Once Antigravity on the 48 GB Mac completes step 5, reply in this chat with the **IP Address** and **Username** it displays (for example: `jeeva` and `192.168.0.105`).
