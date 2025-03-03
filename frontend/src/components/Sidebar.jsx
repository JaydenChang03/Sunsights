import React from 'react'
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'Single Analysis', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Bulk Analysis', icon: DocumentTextIcon },
  { name: 'Analytics', icon: ChartBarIcon },
  { name: 'Profile', icon: UserIcon }
]

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <div className="flex flex-col w-64 bg-primary-dark">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-background">Sunsights</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPage === item.name
            return (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.name)}
                className={`${
                  isActive
                    ? 'bg-secondary text-background'
                    : 'text-background hover:bg-primary hover:text-background'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors duration-150`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-background' : 'text-background group-hover:text-background'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-secondary p-4">
        <button
          onClick={onLogout}
          className="flex-shrink-0 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-background hover:bg-primary hover:text-background transition-colors duration-150"
        >
          <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-background group-hover:text-background" />
          Sign out
        </button>
      </div>
    </div>
  )
}
