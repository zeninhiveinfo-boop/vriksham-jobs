#!/usr/bin/env python3
import os
import sys
import pexpect
import subprocess
from pathlib import Path

HOST = "145.79.213.65"
PORT = "65002"
USER = "u310108218"
PASS = "8971520151aA@"
DB_USER = "u310108218_jeeva"
DB_PASS = "9945Jeeva"
DB_NAME = "u310108218_vriksham"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TAR_FILE = PROJECT_ROOT / "app_code_update.tar.gz"

def create_tar():
    print("[1/4] Creating archive of app/ and lib/...")
    cmd = ["tar", "-czf", str(TAR_FILE), "app", "lib"]
    subprocess.run(cmd, cwd=PROJECT_ROOT, check=True)
    print(f"      Created {TAR_FILE.name} ({TAR_FILE.stat().st_size} bytes)")

def upload_and_deploy():
    print("[2/4] Uploading archive to Hostinger...")
    scp_cmd = f"scp -P {PORT} '{TAR_FILE}' {USER}@{HOST}:/home/{USER}/app_code_update.tar.gz"
    child = pexpect.spawn(scp_cmd, timeout=120)
    i = child.expect(['[Pp]assword:', pexpect.TIMEOUT, pexpect.EOF])
    if i == 0:
        child.sendline(PASS)
        child.expect(pexpect.EOF, timeout=120)
        print("      Upload complete!")
    else:
        raise Exception("SCP upload failed")

    print("[3/4] Extracting files into nodejs/ and updating DB...")
    ssh_cmd = f"ssh -p {PORT} {USER}@{HOST}"
    child = pexpect.spawn(ssh_cmd, timeout=120)
    child.expect('[Pp]assword:')
    child.sendline(PASS)
    child.expect('in-mum-web2201')

    remote_cmds = [
        "tar -xzf /home/u310108218/app_code_update.tar.gz -C /home/u310108218/domains/vrikshamjobs.com/nodejs/",
        "rm -f /home/u310108218/app_code_update.tar.gz",
        f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} --socket=/var/lib/mysql/mysql.sock -e \"UPDATE JobOrder SET currency = 'INR' WHERE currency != 'INR';\"",
        "touch /home/u310108218/domains/vrikshamjobs.com/nodejs/tmp/restart.txt"
    ]

    for c in remote_cmds:
        child.sendline(c)
        child.expect('in-mum-web2201')
        print(f"      Ran: {c[:60]}...")

    child.sendline("exit")
    print("[4/4] Deployment finished successfully!")

def cleanup():
    if TAR_FILE.exists():
        TAR_FILE.unlink()

if __name__ == "__main__":
    try:
        create_tar()
        upload_and_deploy()
    finally:
        cleanup()
