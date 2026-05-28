// src/components/layout/DashboardLayout.jsx
// Wraps every admin page with a fixed sidebar and a sticky topbar.
// Uses React Router's <Outlet /> to render the nested page content.

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const FONT_STACK =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const SIDEBAR_WIDTH = 240;

const s = {
    wrap: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: FONT_STACK,
        color: '#0f172a',
    },
    main: {
        flex: 1,
        marginLeft: SIDEBAR_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    content: {
        flex: 1,
        padding: '24px 28px',
    },
};

export default function DashboardLayout() {
    return (
        <div style={s.wrap}>
            <Sidebar />
            <div style={s.main}>
                <Topbar />
                <main style={s.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
