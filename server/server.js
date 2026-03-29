import app from '../server/src/app.js';
import connectDB from './src/db/db.js';

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server running at port ' + PORT);
});

