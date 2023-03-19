export default function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email } = req.body;
        res.status(200).json({ name, email });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
