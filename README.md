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
# Optimized for Android 12/13/14 and Magisk v26.4+
set -e

FACTION="BEAR"
CHROOT_DIR="/data/local/nhsystem/kalifs"
NH_PATH="/data/data/com.offsec.nhterm/files/usr/bin/kali"

echo "[*] Initializing Boot-kali-install for Android 12+..."

# 1. Root Check
if ! su -c "id" > /dev/null 2>&1; then
    echo "[!] Error: Root not detected. Grant Termux root permissions in Magisk."
    exit 1
fi

# 2. Dynamic Magisk/Zygisk Detection
MAGISK_BIN=$(su -c "magisk --path")/magisk
[ -z "$MAGISK_BIN" ] && MAGISK_BIN="/sbin/magisk"
echo "[+] Using Magisk binary at: $MAGISK_BIN"

# 3. Chroot Path Validation
if [ ! -d "$CHROOT_DIR" ]; then
    if su -c "[ -d /data/local/nhsystem/kali-arm64 ]"; then
        echo "[*] Symlinking kali-arm64 to kalifs..."
        su -c "ln -s /data/local/nhsystem/kali-arm64 $CHROOT_DIR"
    else
        echo "[!] Error: Kali chroot not found. Please install NetHunter Rootless or Full first."
        exit 1
    fi
fi

# 4. Advanced Launch Shim (Improved with DNS and Environment isolation)
echo "[*] Creating persistent Kali launcher..."
cat <<EOF >./kali_shim
#!/system/bin/sh
# Isolate environment to prevent Android/Termux library leaks
unset LD_PRELOAD
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export TERM=xterm-256color
export HOME=/root

$MAGISK_BIN su --mount-master -c "
    # Ensure mounts are active
    mount -o remount,dev,suid /data
    [ ! -d $CHROOT_DIR/proc/1 ] && mount -t proc proc $CHROOT_DIR/proc
    [ ! -d $CHROOT_DIR/sys/kernel ] && mount -t sysfs sysfs $CHROOT_DIR/sys
    mount -o bind /dev $CHROOT_DIR/dev
    mount -t devpts devpts $CHROOT_DIR/dev/pts
    mount -o bind /sdcard $CHROOT_DIR/sdcard

    # Fix DNS inside Chroot (Crucial for A12+)
    echo 'nameserver 8.8.8.8' > $CHROOT_DIR/etc/resolv.conf
    echo 'nameserver 1.1.1.1' >> $CHROOT_DIR/etc/resolv.conf
    
    # Enter Chroot
    chroot $CHROOT_DIR /bin/bash -l
"
EOF

# Deploy shim
sed -i 's/\r$//' ./kali_shim
chmod 755 ./kali_shim
su -c "cp ./kali_shim $NH_PATH && chmod 755 $NH_PATH"
rm ./kali_shim

# 5. Apply Phantom Process Killer Fix (Updated for Android 14)
echo "[*] Optimizing Android Process Manager..."
su -c "settings put global settings_config_gravity_ignore_pull_res true"
su -c "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"

# 6. Set Hostname and Faction
su -c "$MAGISK_BIN su --mount-master -c \"chroot $CHROOT_DIR /bin/bash -c 'echo kali > /etc/hostname; echo $FACTION > /etc/faction'\""

echo "------------------------------------------------------------"
echo "[+] Setup Complete."
echo "[+] Type 'kali' (or your configured command) to enter NetHunter."
echo "[+] Note: If apps detect root, configure Shamiko/DenyList in Magisk."
echo "------------------------------------------------------------"
```
