import { Typography, Container, Box } from '@mui/material';

export default function ExplorePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore Campaigns
        </Typography>
        <Typography variant="body1">
          Browse all available campaigns on CryptoStarter.
        </Typography>
      </Box>
    </Container>
  );
} 