const config = {};

///port -> what port the application should listen on
config.port = 3203;

module.exports = config;


config.providerCommitmentsBaseUrl = "https://localhost:5001";
config.employerCommitmentsBaseUrl = "https://localhost:44376";

config.levyaccounts = ['8194', '8193'];

config.hashedlevyaccountlegalentities = ['X9JE72','XJGZ72'];


config.employerReservations = [
    {
        accountId: "VN48RP",
        accountLegalEntityId: "XEGE5X",
        title: 'Test Reservation for MegaCorp Pharma',
        subtitle: 'Lab Scientist',
        courseCode: '44',
        startMonthYear: '072020'
    },
    {
        accountId: "VN48RP",
        accountLegalEntityId: "XJGZ72",
        title: 'Test Reservation for MegaCorp Bank',
        subtitle: 'Accountancy Taxation Professional',
        courseCode: '204',
        startMonthYear: '072020'
    },
    {
        accountId: "VNR6P9",
        accountLegalEntityId: "X9JE72",
        title: 'Test Reservation for Rapid Logistics',
        subtitle: 'Supply Chain Leadership Professional',
        courseCode: '398',
        startMonthYear: '072020'
    }
];

