import React from 'react';
import { Button } from '../ui/button';
import { ClipboardList, Users, Settings } from 'lucide-react';

interface AdminSidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	viewMode?: 'mobile' | 'desktop';
}


const AdminSidebar = ({ activeTab, onTabChange, viewMode = 'desktop' }: AdminSidebarProps) => {
	// Mobile : barre horizontale arrondie, identique aux autres sidebars
	if (viewMode === 'mobile') {
		return (
			<nav className="flex flex-row justify-center items-center gap-8 py-3 px-4 bg-white dark:bg-gray-900 rounded-full shadow-lg w-full border-2 border-blue-400 dark:border-blue-600 overflow-x-auto">
				<button
					aria-label="Tableau de bord"
					onClick={() => onTabChange('dashboard')}
					className={`rounded-full p-2 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
				>
					<ClipboardList className="h-[22px] w-[22px]" />
				</button>
				<button
					aria-label="Utilisateurs"
					onClick={() => onTabChange('users')}
					className={`rounded-full p-2 transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
				>
					<Users className="h-[22px] w-[22px]" />
				</button>
				<button
					aria-label="Configuration"
					onClick={() => onTabChange('configuration')}
					className={`rounded-full p-2 transition-all ${activeTab === 'configuration' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
				>
					<Settings className="h-[22px] w-[22px]" />
				</button>
			</nav>
		);
	}
	// Desktop : sidebar verticale, identique aux autres sidebars
	return (
		<div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 z-50 relative">
			<nav className="space-y-2">
				<Button
					variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
					className="w-full justify-start"
					onClick={() => onTabChange('dashboard')}
				>
					<ClipboardList className="mr-2 h-4 w-4" />
					Tableau de bord
				</Button>
				<Button
					variant={activeTab === 'users' ? 'default' : 'ghost'}
					className="w-full justify-start"
					onClick={() => onTabChange('users')}
				>
					<Users className="mr-2 h-4 w-4" />
					Utilisateurs
				</Button>
				<Button
					variant={activeTab === 'configuration' ? 'default' : 'ghost'}
					className="w-full justify-start"
					onClick={() => onTabChange('configuration')}
				>
					<Settings className="mr-2 h-4 w-4" />
					Configuration
				</Button>
			</nav>
		</div>
	);
};

export default AdminSidebar;
