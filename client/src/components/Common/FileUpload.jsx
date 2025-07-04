import { Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

const FileUpload = ({ onFileSelect, id = 'file-input' }) => (
  <Button component="label" variant="contained" startIcon={<UploadIcon />}>
    Open Mapping File
    <input
      type="file"
      accept=".ini"
      hidden
      id={id}
      onChange={onFileSelect}
    />
  </Button>
);

export default FileUpload;

