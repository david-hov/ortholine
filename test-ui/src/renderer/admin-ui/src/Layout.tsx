import { HtmlHTMLAttributes } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { CoreLayoutProps } from 'react-admin';
import { ErrorBoundary } from 'react-error-boundary';

import { Error } from 'react-admin';
import Header from './navigation/Header';

const Layout = (props: LayoutProps) => {
    const { children } = props;
    return (
        <>
            <CssBaseline />
            <Header />
            <Container sx={{ maxWidth: { xl: 1280 } }}>
                <main id="main-content">
                    {/* @ts-ignore */}
                    <ErrorBoundary FallbackComponent={Error}>
                        {children}
                    </ErrorBoundary>
                </main>
            </Container>
        </>
    );
};

export interface LayoutProps
    extends CoreLayoutProps,
    Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> { }

export default Layout;
