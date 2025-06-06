import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

export default function MessengerSidebar() {
  return (
    <div className="messenger-sidebar">
      <div className="sidebar-header">
        <IconButton>
          <MenuIcon />
        </IconButton>
        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Search messages..." />
        </div>
      </div>
    </div>
  );
}