import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Athlete() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/athletes', { replace: true }); }, [navigate]);
  return null;
}
