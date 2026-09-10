function Icon({ children, className = 'h-4 w-4', ...props }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const Loader2 = (props) => <Icon {...props}><path d="M21 12a9 9 0 1 1-6.2-8.6" /></Icon>
export const X = (props) => <Icon {...props}><path d="M18 6 6 18M6 6l12 12" /></Icon>
export const CheckCircle2 = (props) => <Icon {...props}><path d="M9 12l2 2 4-5" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></Icon>
export const XCircle = (props) => <Icon {...props}><path d="m15 9-6 6M9 9l6 6" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></Icon>
export const AlertCircle = (props) => <Icon {...props}><path d="M12 8v5M12 17h.01" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></Icon>
export const Inbox = (props) => <Icon {...props}><path d="M4 13h4l2 3h4l2-3h4" /><path d="M5 6h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2-7Z" /></Icon>
export const Bell = (props) => <Icon {...props}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></Icon>
export const CheckCheck = (props) => <Icon {...props}><path d="m3 12 3 3 5-7" /><path d="m13 12 3 3 5-7" /></Icon>
export const LogIn = (props) => <Icon {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></Icon>
export const UserPlus = (props) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M19 8v6M22 11h-6" /></Icon>
export const Briefcase = (props) => <Icon {...props}><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /><path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" /><path d="M3 13h18" /></Icon>
export const LayoutDashboard = (props) => <Icon {...props}><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" /></Icon>
export const LogOut = (props) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Icon>
export const Menu = (props) => <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
export const Users = (props) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M22 21v-2a4 4 0 0 0-3-3.8" /><path d="M16 3.2a4 4 0 0 1 0 7.6" /></Icon>
export const Plus = (props) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
export const Activity = (props) => <Icon {...props}><path d="M22 12h-4l-3 8-6-16-3 8H2" /></Icon>
export const Edit3 = (props) => <Icon {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>
export const Trash2 = (props) => <Icon {...props}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></Icon>
export const Download = (props) => <Icon {...props}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Icon>
export const Paperclip = (props) => <Icon {...props}><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3 3 0 0 1 4 4l-8.5 8.5a1 1 0 0 1-1.5-1.5L16 8" /></Icon>
export const Send = (props) => <Icon {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icon>
export const MoreHorizontal = (props) => <Icon {...props}><path d="M5 12h.01M12 12h.01M19 12h.01" /></Icon>
