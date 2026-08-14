import { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
  Spinner, Table, Thead, Tbody, Tr, Th, Td, Text, TableContainer, Heading, Box, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Select
} from '@chakra-ui/react';


// graphQL query to fetch customers data
const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      email
      role
      city {
        name
      }
    }
  }
`;



// graphQL query to fetch cities for the dropdown option
const GET_CITIES = gql`
  query GetCities {
    cities {
      id
      name
    }
  }
`;



// graphQL mutation to insert a new customer
const ADD_CUSTOMER = gql`
  mutation AddCustomer($name: String!, $email: String!, $role: String!, $cityId: Int!) {
    insert_customers_one(object: { name: $name, email: $email, role: $role, city_id: $cityId }) {
      id
    }
  }
`;

function App() {
  const { loading, error, data, refetch } = useQuery(GET_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: citiesData } = useQuery(GET_CITIES);
 const [addCustomer, { loading: saving }] = useMutation(ADD_CUSTOMER, {
    onCompleted: () => {
      refetch();
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setRole('');
      setCityId('');
    }
  });

  //add new customer form fields 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [cityId, setCityId] = useState('');

  // loading and error handling
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size="xl" /></div>
  if (error) return <Text>Something went wrong: {error.message}</Text>;

  //save new customer data to the database
  const handleSave = () => {
    addCustomer({
      variables: { name, email, role, cityId: Number(cityId) }
    });
  };

  // if everthing is fine show table data 
  return (
    <Box p="7">
      <Heading mb="4" size="lg">Customers</Heading>
      <Button mb="4" colorScheme="blue" onClick={() => setIsModalOpen(true)}>
        Add New Record
      </Button>

      {/* table to show customer data */}

      <TableContainer border="1px solid" borderColor="gray.200" rounded="md">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>City</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.customers.map((customer: any) => (
              <Tr key={customer.id}>
                <Td>{customer.name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.role}</Td>
                <Td>{customer.city.name}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* modal for adding new customer */}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="3">
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Email</FormLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Role</FormLabel>
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>City</FormLabel>
              <Select placeholder="Select city" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                {citiesData?.cities.map((city:any) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={2} onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;