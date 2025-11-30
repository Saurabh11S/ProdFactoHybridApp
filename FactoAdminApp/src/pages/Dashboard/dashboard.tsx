import HeaderBar from '../../components/common/HeaderBar';
import DashboardCards from '../../components/Dashboard/dashboardCards';
import { DashboardLineChart } from '../../components/Dashboard/dashboardLineChart';
import NotificationBar from '@/components/Dashboard/notificationBar';
import { DashboardBarChart } from '@/components/Dashboard/dashboardBarChart';

function Dashboard() {
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <HeaderBar pageTitle="Dashboard" />

      <DashboardCards />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <DashboardLineChart />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <NotificationBar />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <DashboardBarChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
