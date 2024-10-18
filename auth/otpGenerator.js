import otpGenerator from 'otp-generator'


const generateOTP = () => {
    const otp = otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false  });
    return otp;
};

export default generateOTP;