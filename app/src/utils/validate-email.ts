export const validateEmail = (email: string) => {
  const storageTableSize = 200
  let re =
    /^(([a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email) && email.length <= storageTableSize
}
