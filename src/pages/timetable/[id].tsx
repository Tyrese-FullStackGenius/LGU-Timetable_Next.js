import Timetable from '~/components/Timetable';

import Router, { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import { useEffect, useState } from 'react';

import { onSnapshot, doc, getDocs, getDoc } from 'firebase/firestore';
import { timeTableCol } from '~/lib/firebase';

import { motion } from 'framer-motion';
import { Center } from '@chakra-ui/react';
import Head from 'next/head';
import { SocialLinks } from '~/components/seo/Seo';
import { GetStaticPathsContext, GetStaticPropsContext } from 'next';
import { NextResponse } from 'next/server';
import { TimetableDocType } from '~/types/typedef';

export async function getStaticPaths() {
   const timetableDocs = await getDocs(timeTableCol);

   const paths = timetableDocs.docs.map(doc => ({params: {id: doc.id}}))
   
   return {
     paths,
     fallback: "blocking", // can also be true or 'blocking'
   }
}

export async function getStaticProps (context: GetStaticPropsContext)
{
   const id = context.params!.id;

   const docRef = doc(timeTableCol, id as string);
   const timetable = (await getDoc(docRef)).data();

   return {
      props: {
         timetable: {id: id, ...timetable}
      },
      revalidate: 5000
   }
}

interface GetStaticPropsReturnType extends TimetableDocType
{
   id: string
}

export default function TimetablePage({ timetable } : { timetable: GetStaticPropsReturnType}) {
   const router = useRouter();

   useEffect(()=> {
      if (!timetable.timetable)
         router.push("/timetable");
   }, []);

   return (
      <>
         <Head>
            <title>LGU Timetable</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <meta
               name="description"
               content={`A non-official blazingly 🔥 fast website to access the LGU timetable and lgu timetable developer APIS. timetable of ${timetable.id as string}.`}
            />
            
            <meta
               name="keywords"
               content={`LGU timetable, lgu time table, lgu, lgu class time table, non official lgu time table, fast lgu timetable, new lgu timetable, lgu new timetable, lgu better timetable, lgu timetable live, lgu free classes, lahore garrison university timetable, lahore garrison university new timetable, lahore garrison university fast timetable, lgu api, lgu developer apis, free classrooms`}
            />

            <SocialLinks />
         </Head>
         {timetable.timetable && <TimetableRenderer timetable={timetable} />}
      </>
   );
}

function TimetableRenderer({ timetable }: { timetable: any }) {
   const [timetableData, setTimetableData] = useState<any>();

   useEffect(() => {
     setTimetableData(timetable);
   }, []);
   
   return (
      <>
         {!timetableData && (
            <Center color={'green.600'}>
               <ClipLoader cssOverride={{ width: '6rem', height: '6rem' }} color="white" />
            </Center>
         )}

         {timetableData && (
            <motion.div
               initial={{ opacity: 0.5 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.1, type: 'keyframes' }}
            >
               <Timetable
                  metaData={timetable.id}
                  timetableData={timetableData}
               />
            </motion.div>
         )}
      </>
   );
}

