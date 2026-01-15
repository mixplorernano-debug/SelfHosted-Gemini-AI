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

```bash
#!/data/data/com.termux/files/usr/bin/bash
# Optimized for Magisk 27.x - 30.x and Android 12/13/14+
# Targeted for high-performance Chroot stability
set -e

# --- Variable Definitions ---
FACTION="BEAR"
CHROOT_DIR="/data/local/nhsystem/kalifs"
NH_PATH="/data/data/com.offsec.nhterm/files/usr/bin/kali"
SDCARD="/sdcard"

echo "[*] Initializing NetHunter Boot-kali for Android 14 / Magisk 30.x..."

# 1. Advanced Root & Magisk Environment Check
if ! su -c "id" >/dev/null 2>&1; then
    echo "[!] Error: Root access denied. Please allow root in Magisk/KernelSU/APatch."
    exit 1
fi

# Detect Magisk Path (Magisk 26+ uses dynamic paths)
MAGISK_PATH=$(su -c "magisk --path")
MAGISK_BIN="$MAGISK_PATH/magisk"
[ -z "$MAGISK_PATH" ] && MAGISK_BIN="/sbin/magisk"

echo "[+] Magisk Binary detected: $MAGISK_BIN"

# 2. Filesystem & Path Consistency
if [ ! -d "$CHROOT_DIR" ]; then
    # Modern NH often uses kali-arm64 or kali-amd64
    POSSIBLE_DIR=$(su -c "ls -d /data/local/nhsystem/kali-* 2>/dev/null | head -n 1")
    if [ -n "$POSSIBLE_DIR" ]; then
        echo "[*] Found chroot at $POSSIBLE_DIR. Symlinking..."
        su -c "ln -sf $POSSIBLE_DIR $CHROOT_DIR"
    else
        echo "[!] Error: Kali chroot not found in /data/local/nhsystem/"
        exit 1
    fi
fi

# 3. Enhanced Launch Shim with Android 14 Mount Logic
echo "[*] Deploying Advanced Kali Shim..."
cat <<EOF >./kali_shim
#!/system/bin/sh
# Use mount-master to ensure visibility across all namespaces
$MAGISK_BIN su --mount-master -c "
    # Remount /data with execute permissions
    mount -o remount,dev,suid,exec /data
    
    # Standard Mounts
    mount -t proc proc $CHROOT_DIR/proc
    mount -t sysfs sysfs $CHROOT_DIR/sys
    mount -o bind /dev $CHROOT_DIR/dev
    mount -t devpts devpts $CHROOT_DIR/dev/pts
    
    # Android 12+ Fix: Bind mount /sdcard for file access
    [ -d $CHROOT_DIR/sdcard ] || mkdir -p $CHROOT_DIR/sdcard
    mount -o bind $SDCARD $CHROOT_DIR/sdcard

    # Fix for Shared Memory (Required for some Pentest tools)
    mount -t tmpfs -o size=256M tmpfs $CHROOT_DIR/dev/shm

    # Enter Chroot
    chroot $CHROOT_DIR /usr/bin/env -i \
        HOME=/root \
        TERM=\$TERM \
        PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
        /bin/bash -l
"
EOF

# Clean, Deploy, and Set Permissions
sed -i 's/\r$//' ./kali_shim
chmod 755 ./kali_shim
su -c "cp ./kali_shim $NH_PATH && chmod 755 $NH_PATH"
rm ./kali_shim

# 4. Networking & DNS Fix (Android 13+ Stability)
echo "[*] Patching DNS for Chroot stability..."
su -c "$MAGISK_BIN su -c \"echo 'nameserver 8.8.8.8' > $CHROOT_DIR/etc/resolv.conf\""
su -c "$MAGISK_BIN su -c \"echo 'nameserver 1.1.1.1' >> $CHROOT_DIR/etc/resolv.conf\""

# 5. Comprehensive Phantom Process Killer (PPK) Fixes
echo "[*] Applying Android 14 Process Management Fixes..."

# Disable Phantom Process Killer entirely
su -c "settings put global phantom_process_killer_enable false" 2>/dev/null
# Increase max phantom processes to max integer
su -c "/system/bin/device_config put activity_manager max_phantom_processes 2147483647" 2>/dev/null
# Gravity Pull fix (prevents background freezing)
su -c "settings put global settings_config_gravity_ignore_pull_res true" 2>/dev/null

echo "------------------------------------------------------------"
echo "[+] Setup Complete for Magisk 30.x Environment."
echo "[+] Run 'kali' to start the environment."
echo "------------------------------------------------------------"
```
