import { Button, Badge } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';

export default function Linux() {
    return (
      <div>
        <Button variant="outlined" color="secondary">Primary</Button>
        <p>linux :)</p>
        <Badge badgeContent={4} color="primary">
          <MailIcon color="action" />
        </Badge>
      </div>
    );
  }
  
  
  