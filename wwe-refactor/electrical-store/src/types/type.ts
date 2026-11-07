export type NavItem = {
  label: string;
  path: string;
  icon?: string;
  disabled?: boolean;
  children?: NavItem[];
};
