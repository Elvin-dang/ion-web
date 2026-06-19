/**
 * 3.3 + 3.4 — Requests & Work Orders (Building Manager).
 *
 * Merged section: a single nav entry with two tabs. Requests and Work Orders
 * keep their own data model, list views and detail routes — this wrapper only
 * unifies navigation. The active tab is derived from the URL so deep links
 * (`/bm/requests?status=Pending`, `/bm/work-orders`) and breadcrumbs from the
 * detail pages still land on the right tab.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PageHeader from '../../../components/PageHeader';
import RequestListPage from './RequestListPage';
import WorkOrderListPage from './WorkOrderListPage';

export default function RequestsWorkOrdersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tab = pathname.startsWith('/bm/work-orders') ? 'work-orders' : 'requests';

  return (
    <Box>
      <PageHeader
        title="Requests & Work Orders"
        subtitle="Tenant/ad-hoc requests and the work orders that fulfil them"
      />
      <Tabs
        value={tab}
        onChange={(_, v) => navigate(v === 'work-orders' ? '/bm/work-orders' : '/bm/requests')}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="requests" label="Requests" />
        <Tab value="work-orders" label="Work Orders" />
      </Tabs>

      {tab === 'work-orders' ? <WorkOrderListPage embedded /> : <RequestListPage embedded />}
    </Box>
  );
}
