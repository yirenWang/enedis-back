const getUser = (req, res) => {
  const data = {
    firstname: 'Toto',
    lastname: 'Dupont Dupont',
    contact_data: {
      phone: '06 00 00 00 00',
      email: 'toto@dupont.com',
    },
  };
  res.send(data);
};
