import * as React from "react"
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { LayoutDashboard, FileText, Menu, WalletCards, Inbox } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    mobile?: boolean;
    onClose?: () => void;
}

export function Sidebar({ className, mobile, onClose }: SidebarProps) {
    const { t } = useTranslation();

    const links = [
        {
            href: '/dashboard',
            label: t('nav.dashboard', 'Dashboard'),
            icon: LayoutDashboard
        },
        {
            href: '/templates',
            label: t('nav.templates', 'Templates'),
            icon: FileText
        },
        {
            href: '/workflow-editor',
            label: 'Workflow Editor',
            icon: WalletCards
        },
        {
            href: '/briefings',
            label: t('nav.briefings', 'Briefings'),
            icon: Inbox
        }
    ];

    const Content = (
        <div className={cn("pb-12 h-full bg-card", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center">
                        <WalletCards className="mr-2 h-6 w-6 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            BriefAI
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isActive ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground bg-transparent"
                                    )
                                }
                            >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                {/* Footer content or user credits later */}
            </div>
        </div>
    );

    if (mobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    {Content}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className={cn("hidden border-r bg-card md:block w-64 fixed h-full", className)}>
            <ScrollArea className="h-full">
                {Content}
            </ScrollArea>
        </div>
    );
}
