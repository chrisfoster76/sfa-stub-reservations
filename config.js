const config = {};

///port -> what port the application should listen on
config.port = 3203;

module.exports = config;


config.providerCommitmentsBaseUrl = "https://localhost:5001";
config.employerCommitmentsBaseUrl = "https://localhost:44376";

config.levyaccounts = ['8194', '8193'];
config.hashedLevyAccounts = ['VN48RP'];
config.levyaccountlegalentities = ['2817', '2818'];
config.hashedlevyaccountlegalentities = ['XEGE5X','XJGZ72'];


config.employerReservations = [
    {
        accountId: "VNR6P9",
        accountLegalEntityId: "X9JE72",
        title: 'Test Reservation for Rapid Logistics',
        subtitle: 'Supply Chain Leadership Professional',
        courseCode: '398',
        startMonthYear: '072020'
    }
];

