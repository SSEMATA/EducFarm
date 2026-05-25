import DashboardLayout from '../../layouts/DashboardLayout';
import DevicePairingCard from './DevicePairingCard';
import TestDeviceCard from './TestDeviceCard';
import styles from './DeviceManagement.module.css';

export default function DeviceManagement() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Device Management</h1>
          <p className={styles.pageSubtitle}>Pair and test your hardware devices before full registration</p>
        </div>
        <DevicePairingCard />
        <TestDeviceCard />
      </div>
    </DashboardLayout>
  );
}
