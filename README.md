<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sGvntbg0wDoqQmAGJFF5MNeQCrXVDO6-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Updating NetHunter scripts for **Magisk v30+** (and current Android 14/15 versions) requires addressing significant changes in Magisk's architecture, specifically regarding **Mount Namespaces**, the removal of the `/sbin` folder, and more aggressive "Phantom Process" management.

Here is the updated script, followed by a technical breakdown of the improvements.

### Updated Script: NetHunter Architecture v30+

```bash
#!/data/data/com.termux/files/usr/bin/bash
# Mode: Optimized Update for Magisk v30+ & Android 12/13/14/15
# Enhanced for Global Mount Namespace Persistence
set -e

# --- Variable Definitions ---
FACTION="BEAR Hunter Script Architect"
CHROOT_DIR="/data/local/nhsystem/kalifs"
NH_PATH="/data/data/com.offsec.nhterm/files/usr/bin/kali"

echo "[*] Initializing Boot-kali-update for Magisk v30+..."

# 1. Improved Root & Magisk Detection
if ! command -v su > /dev/null; then
    echo "[!] Error: Root not detected. Run inside Termux with root access."
    exit 1
fi

# Magisk v26-v30+ uses a dynamic path. We locate the binary via 'which' or internal magisk call.
MAGISK_PATH=$(su -c "which magisk")
if [ -z "$MAGISK_PATH" ]; then
    MAGISK_PATH="/data/adb/magisk/magisk" # Fallback to standard internal path
fi
echo "[+] Magisk binary identified at: $MAGISK_PATH"

# 2. Verify Existing Installation
if ! su -c "[ -d $CHROOT_DIR ]"; then
    echo "[!] Error: Chroot directory $CHROOT_DIR not found!"
    exit 1
fi

# 3. Create Advanced Launch Shim (Namespace-Aware)
# Modern Android requires entering the Global Namespace (nsenter) to ensure 
# mounts are visible to the NetHunter Terminal app, not just the Termux session.
echo "[*] Creating namespace-aware Kali launcher..."
cat <<EOF >./kali_shim
#!/system/bin/sh
# Use nsenter to join the init mount namespace (Global Namespace)
# This ensures chroot mounts don't disappear when the Termux session closes.

$MAGISK_PATH su -mm -c "
    # Ensure /data is not noexec
    mount -o remount,dev,suid /data
    
    # Mount core filesystems only if not already mounted
    [ ! -d $CHROOT_DIR/proc/1 ] && mount -t proc proc $CHROOT_DIR/proc
    [ ! -d $CHROOT_DIR/sys/kernel ] && mount -t sysfs sysfs $CHROOT_DIR/sys
    [ ! -d $CHROOT_DIR/dev/pts ] && mount -o bind /dev $CHROOT_DIR/dev
    [ ! -c $CHROOT_DIR/dev/pts/0 ] && mount -t devpts devpts $CHROOT_DIR/dev/pts
    
    # Critical for Android 13+: Fix shared memory
    mount -t tmpfs tmpfs $CHROOT_DIR/dev/shm -o rw,nosuid,nodev,noexec,mode=1777
    
    # Enter Chroot
    chroot $CHROOT_DIR /usr/bin/env -i \\
        HOME=/root \\
        TERM=\$TERM \\
        PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \\
        /bin/bash -l
"
EOF

# Deploy Shim
sed -i 's/\r$//' ./kali_shim
chmod 755 ./kali_shim
su -c "cp ./kali_shim $NH_PATH && chmod 755 $NH_PATH"
rm ./kali_shim

# 4. Identity Injection (Using -mm to ensure persistence)
echo "[*] Applying Faction ($FACTION) and Prompt..."
su -mm -c "chroot $CHROOT_DIR /bin/bash -c \"echo 'export PS1=\\\"┌──(root㉿kali)-[/]\n└─# \\\"' >> /root/.bashrc\""
su -mm -c "chroot $CHROOT_DIR /bin/bash -c \"echo $FACTION > /etc/faction\""

# 5. Advanced Phantom Process Killer (PPK) Fix for Android 14
echo "[*] Optimizing Android Process Manager..."

# Disabling the Phantom Process Killer (Modern method)
su -c "settings put global settings_config_gravity_ignore_pull_res true"
su -c "device_config put activity_manager max_phantom_processes 2147483647"
# Add child process limit fix (Android 13/14 specific)
su -c "device_config put activity_manager enable_phantom_process_killer false"

echo "------------------------------------------------------------"
echo "[+] Update Complete for Magisk v30+ Environment."
echo "[+] Tip: If Kali closes unexpectedly, check 'Disable Child Process Restrictions' in Developer Options."
echo "------------------------------------------------------------"
```

---

### Technical Advice & Improvements

#### 1. Namespace Isolation (`-mm` vs `--mount-master`)
In older Magisk versions, `--mount-master` was the standard. In v30+, Magisk has refined its handling of namespaces. 
*   **The Problem:** By default, every app (including Termux) has its own "Mount Namespace." If you mount Kali's `/proc` or `/sys` inside Termux's namespace, the NetHunter Terminal app won't see them, leading to "Permission Denied" errors.
*   **The Fix:** Using `su -mm` or `nsenter -t 1 -m` forces the script to execute in the **Global/Root Namespace**. This makes the Kali chroot visible to all apps on the system.

#### 2. Deprecation of `/sbin`
Magisk v26+ and v30+ have moved away from `/sbin` to comply with modern Android filesystem layouts. 
*   **Improvement:** The script now uses `which magisk` or targets `/data/adb/magisk/magisk`. Never hardcode `/sbin/magisk` in 2024+ scripts as it will cause the script to fail on clean installs of Magisk.

#### 3. Android 13/14 `tmpfs` and Shared Memory
Modern Android versions have stricter rules about shared memory (`/dev/shm`).
*   **Improvement:** I added `mount -t tmpfs tmpfs $CHROOT_DIR/dev/shm`. Without this, many Kali tools (like Postgres for Metasploit or certain scanners) will crash because they cannot allocate shared memory.

#### 4. The Phantom Process Killer (PPK)
Android 12 Introduced the PPK, but Android 14 made it even more aggressive. 
*   **The Fix:** The script now includes `enable_phantom_process_killer false`. 
*   **Crucial Step:** Even with the script, users on Android 14 should go to **Settings > Developer Options** and look for **"Disable child process restrictions"** and toggle it **ON**. The script handles the database side, but the toggle ensures the kernel-level watcher is silenced.

#### 5. Idempotent Mounts
Older scripts would try to mount filesystems even if they were already mounted, leading to "Device or resource busy" errors.
*   **Improvement:** The updated shim uses short-circuit logic `[ ! -d ... ] && mount` to check if a directory is already populated before attempting a mount. This allows you to run the script multiple times without errors.

#### 6. Shebang Consistency
Always ensure your script starts with `#!/data/data/com.termux/files/usr/bin/bash`. If you use `/bin/bash`, the script will fail in Termux because `/bin/bash` does not exist on Android unless you are already inside the chroot.
