import {
   Accordion,
   AccordionButton,
   AccordionItem,
   AccordionPanel,
   Box,
   Button,
   Center,
   Flex,
   Heading,
   Input,
   Text,
   Textarea,
   useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { docsCol } from '~/lib/firebase';
import { updateDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { UserCredentialsContext } from '~/hooks/UserCredentialsContext';
import { admin_mail } from '~/lib/constant';
import React from 'react';

import { LINKS } from '~/lib/constant';
import Loader from './design/Loader';
import { IApiDoc } from '~/types/typedef';

export default function APIDocs({ staticDocs }: { staticDocs: Array<IApiDoc> }) {
   const [docs, setDocs] = useState<Array<IApiDoc>>(staticDocs);

   const user = useContext(UserCredentialsContext);
   const [loading, setLoading] = useState<boolean>(false);

   //! not required since using staticSiteRendering
   // useEffect(() => {
   //    async function fetchDocs() {
   //       setLoading(true);
   //       const docs = await getDocs(docsCol);
   //       const res = docs.docs.map((doc) => ({ id: doc.id, docData: doc.data().doc }));
   //       setDocs(res);
   //       setLoading(false);
   //    }
   //    fetchDocs();
   // }, []);

   return (
      <Flex width={'100%'} justifyContent={'center'} marginY={'2rem'} flexDirection={'column'}>
         <Center>
            <Heading className="roboto" colorScheme="gray" marginY={'1rem'}>
               API Documentation
            </Heading>
         </Center>

         {loading && <Loader>Loading Docs...</Loader>}
         {user?.user && <>{user.user.email == admin_mail && <AdminUploads docs={docs} />}</>}

         {docs.map((doc, key) => {
            return (
               <React.Fragment key={key}>
                  {doc.id == 'index' && <DocMarkDown text={doc.docData} />}
               </React.Fragment>
            );
         })}

         <Accordion allowToggle>
            {docs.map((doc, key) => {
               return (
                  <React.Fragment key={key}>
                     {doc.id != 'index' && (
                        <DocAccordion title={<DocMarkDown text={doc.id} />}>
                           <DocMarkDown text={doc.docData} />
                        </DocAccordion>
                     )}
                  </React.Fragment>
               );
            })}
         </Accordion>
         <Center>
            <Text
               color={'blue.300'}
               _hover={{ textDecoration: 'underline' }}
               marginY={'3rem'}
               fontSize={'xl'}
            >
               <a href={`${LINKS.API_QA_LINK}`} target="_blank">
                  Have any question or idea? ask here!
               </a>
            </Text>
         </Center>
      </Flex>
   );
}

const DocAccordion = ({
   title,
   children
}: {
   title: React.ReactNode;
   children: React.ReactNode;
}) => {
   return (
      <AccordionItem margin={'0.5rem'}>
         <h2>
            <AccordionButton>
               <Box as="span" flex="1" textAlign="left">
                  {title}
               </Box>
               <AddIcon />
            </AccordionButton>
         </h2>
         <AccordionPanel pb={4}>{children}</AccordionPanel>
      </AccordionItem>
   );
};

const DocMarkDown = ({ text }: { text: string }) => {
   return (
      <>
         <ReactMarkdown
            className="mark-down"
            components={{
               code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                     <SyntaxHighlighter
                        style={nightOwl}
                        language={match[1]}
                        PreTag="div"
                        wrapLongLines={true}
                        className="syntax-highlighter"
                        // {...props}
                     >
                        {String(children).replace(/\n$/, '')}
                     </SyntaxHighlighter>
                  ) : (
                     <code className={className} {...props}>
                        {children}
                     </code>
                  );
               }
            }}
         >
            {text}
         </ReactMarkdown>
      </>
   );
};

const AdminUploads = ({ docs }: { docs: Array<IApiDoc> }) => {
   const [input, setInput] = useState<IApiDoc>();
   const toast = useToast();

   return (
      <Flex
         background={'var(--card-color)'}
         flexDirection={'column'}
         border={'1px solid var(--border-color)'}
         padding={'1rem'}
         marginY={'2rem'}
      >
         <Heading color={'cyan.700'} marginY={'1rem'}>
            Admin
         </Heading>
         <Flex marginY={'1rem'} flexDirection={'column'}>
            {docs.map((doc, idx) => {
               return (
                  <li
                     key={idx}
                     style={{ cursor: 'pointer' }}
                     onClick={(e) => {
                        setInput(doc);
                     }}
                  >
                     {doc.id}
                  </li>
               );
            })}
         </Flex>
         {input?.id != undefined && (
            <>
               <DocMarkDown text={input.docData} />
               <Flex margin={1} />
               <Textarea
                  height={'40vh'}
                  placeholder="Add new Doc"
                  value={input?.docData}
                  onChange={(e) => {
                     setInput({ docData: e.target.value, id: input.id });
                  }}
               />
               <Center marginY={'2rem'} gap={'1rem'}>
                  <Button
                     colorScheme="green"
                     onClick={(e) => {
                        // update doc
                        const docRef = doc(docsCol, input.id);
                        updateDoc(docRef, {
                           doc: input.docData
                        });
                        toast({
                           title: 'updated',
                           description: input.id + ' has been updated',
                           status: 'success'
                        });
                        setInput(undefined);
                     }}
                  >
                     Update
                  </Button>
                  <Button colorScheme="red" onClick={(e) => setInput(undefined)}>
                     Cancel
                  </Button>
               </Center>{' '}
            </>
         )}

         {!input && <CreateNewDoc docs={docs} />}
      </Flex>
   );
};

const CreateNewDoc = ({ docs }: { docs: Array<IApiDoc> }) => {
   const [input, setInput] = useState<IApiDoc>({
      id: '',
      docData: ''
   });

   const toast = useToast();

   return (
      <>
         <Textarea
            height={'10vh'}
            placeholder={'Enter Unique Title'}
            marginY={'1.5rem'}
            value={input?.id}
            onChange={(e) => {
               setInput({ docData: input.docData, id: e.target.value });
            }}
         />
         <DocMarkDown text={input.docData} />
         <Textarea
            height={'40vh'}
            placeholder="Add new Doc"
            value={input?.docData}
            onChange={(e) => {
               setInput({ docData: e.target.value, id: input.id.replace('/', '-') });
            }}
         />
         <Center marginY={'2rem'}>
            {docs.filter((doc) => doc.id == input.id).length > 0 ? (
               <Text color={'red.400'}>Oh No! Document id already exists</Text>
            ) : (
               <Button
                  colorScheme="green"
                  onClick={(e) => {
                     const newDoc = doc(docsCol, input.id);
                     setDoc(newDoc, {
                        doc: input.docData
                     });
                     toast({
                        title: 'new doc uploaded',
                        status: 'success',
                        position: 'bottom'
                     });
                  }}
               >
                  Upload
               </Button>
            )}
         </Center>{' '}
      </>
   );
};
