/**
 * Admin · Requests & Work Orders (merged section, read-only oversight).
 *
 * A single nav entry with two tabs. Each tab keeps its own portal-wide list;
 * this wrapper only unifies navigation. The active tab is derived from the URL
 * so `/admin/requests` and `/admin/work-orders` both resolve correctly.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PageHeader from '../../../components/PageHeader';
import AdminRequestsPage from './AdminRequestsPage';
import AdminWorkOrdersPage from './AdminWorkOrdersPage';

export default function AdminRequestsWorkOrdersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tab = pathname.startsWith('/admin/work-orders') ? 'work-orders' : 'requests';

  return (
    <Box>
      <PageHeader
        title="Requests & Work Orders"
        subtitle="Portal-wide view of requests and work orders across all buildings (read-only)."
      />
      <Tabs
        value={tab}
        onChange={(_, v) =>
          navigate(v === 'work-orders' ? '/admin/work-orders' : '/admin/requests')
        }
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="requests" label="Requests" />
        <Tab value="work-orders" label="Work Orders" />
      </Tabs>

      {tab === 'work-orders' ? <AdminWorkOrdersPage embedded /> : <AdminRequestsPage embedded />}
    </Box>
  );
}
