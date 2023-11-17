import React, { useState, useEffect, useRef } from 'react';
import styles from './userStatisticsModal.module.css';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { getUserBreakdown, getUserStatistics } from '@/app/api/auth/user/route';

const UserStatisticsModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});

  const [chartData1, setChartData1] = useState({});
  const [chartOptions1, setChartOptions1] = useState({});

  const [selectedFilter, setSelectedFilter] = useState('total');
  const [userPercentage, setUserPercentage] = useState({});
  const filterOptions = [
    { label: 'All users', value: 'total' },
    { label: 'Job Seeker', value: 'jobSeeker' },
    { label: 'Corporate', value: 'corporate' },
    { label: 'Recrutier', value: 'recruiter' },
    { label: 'Administrator', value: 'administrator' },
  ];

  const [selectedFilter1, setSelectedFilter1] = useState('week');
  const filterOptions1 = [
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
    { label: 'Day', value: 'day' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const documentStyle = getComputedStyle(document.documentElement);

      const fetchBreakdown = async () => {
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
          '--text-color-secondary'
        );
        const surfaceBorder =
          documentStyle.getPropertyValue('--surface-border');

        const information = await getUserStatistics(accessToken);
        setOverallStats(information.overall);

        const data = {
          labels: information[selectedFilter1].labels,
          datasets: [
            {
              label: 'Job Seeker',
              borderColor: documentStyle.getPropertyValue('--blue-500'),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataJobSeeker,
            },
            {
              label: 'Corporate',
              borderColor: documentStyle.getPropertyValue('--orange-500'),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataCorporate,
            },
            {
              label: 'Recruiter',
              backgroundColor: documentStyle.getPropertyValue('--pink-500'),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataRecruiter,
            },
            {
              label: 'Administrator',
              backgroundColor: documentStyle.getPropertyValue('--gray-500'),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataAdmin,
            },
          ],
        };

        const options = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
            legend: {
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time Period', // your actual x-axis label
                color: textColorSecondary,
              },
              ticks: {
                color: textColorSecondary,
              },
              grid: {
                color: surfaceBorder,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Commission Amount ($)', // your actual y-axis label
                color: textColorSecondary,
              },
              ticks: {
                stepSize: 1,
                color: textColorSecondary,
              },
              grid: {
                color: surfaceBorder,
              },
              beginAtZero: true, // ensures the scale starts at 0
              min: 0,
            },
          },
        };

        setChartData(data);
        setChartOptions(options);
      };
      fetchBreakdown();
    };

    fetchData();
  }, [accessToken, selectedFilter1]);

  const bigCardHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 className="montserrat" style={{ margin: '10px 10px 10px 10px' }}>
          Account Creation Analysis by {selectedFilter1}
        </h2>
        <Dropdown
          value={selectedFilter1}
          options={filterOptions1}
          style={{ margin: '10px 10px 10px 10px' }}
          onChange={(e) => setSelectedFilter1(e.value)}
          placeholder="Select time span"
        />
      </div>
    );
  };

  const smallCardHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 className="montserrat" style={{ margin: '10px 10px 10px 10px' }}>
          {selectedFilter.charAt(0).toUpperCase() +
            selectedFilter.slice(1).toLowerCase()}{' '}
          Status Breakdown
        </h2>
        <Dropdown
          value={selectedFilter}
          options={filterOptions}
          style={{ margin: '10px 10px 10px 10px' }}
          onChange={(e) => setSelectedFilter(e.value)}
          placeholder="Select a role"
        />
      </div>
    );
  };

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);

    const fetchBreakdown = async () => {
      const breakdownInfo = await getUserBreakdown(accessToken);

      const activeData = breakdownInfo.active[selectedFilter];
      const inactiveData = breakdownInfo.inactive[selectedFilter];

      const sum = inactiveData + activeData;
      const total =
        breakdownInfo.active['total'] + breakdownInfo.inactive['total'];

      const activePercentage = Number(((activeData / sum) * 100).toFixed(2));
      const inactivePercentage = Number(
        ((inactiveData / sum) * 100).toFixed(2)
      );
      const proportion = Number(((sum / total) * 100).toFixed(2));
      setUserPercentage({
        active: activePercentage,
        inactive: inactivePercentage,
        proportion: proportion,
      });
      const data = {
        labels: ['Active', 'Inactive'],
        datasets: [
          {
            data: [activeData, inactiveData],
            backgroundColor: [
              documentStyle.getPropertyValue('--blue-500'),
              documentStyle.getPropertyValue('--red-500'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--blue-400'),
              documentStyle.getPropertyValue('--red-400'),
            ],
          },
        ],
      };
      const options = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      };

      setChartData1(data);
      setChartOptions1(options);
    };

    fetchBreakdown();
  }, [accessToken, selectedFilter]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.userStatisticsContainer}>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1 className="montserrat" style={{ fontSize: '3em' }}>
                {overallStats.jobSeeker}
              </h1>
              <p className="montserrat">Job Seeker</p>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-user"
                style={{ fontSize: '5rem', alignItems: 'center' }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1 className="montserrat" style={{ fontSize: '3em' }}>
                {overallStats.recruiter}
              </h1>
              <p className="montserrat">Recruiter</p>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-briefcase"
                style={{ fontSize: '5rem', alignItems: 'center' }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1 className="montserrat" style={{ fontSize: '3em' }}>
                {overallStats.corporate}
              </h1>
              <p className="montserrat">Corporate</p>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-building"
                style={{ fontSize: '5rem', alignItems: 'center' }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1 className="montserrat" style={{ fontSize: '3em' }}>
                {overallStats.administrator}
              </h1>
              <p className="montserrat">Administrator</p>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-eye"
                style={{ fontSize: '5rem', alignItems: 'center' }}
              ></i>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.graphContainer}>
        <Card className={styles.customCardGraph} header={bigCardHeader}>
          <Chart type="line" data={chartData} options={chartOptions} />
        </Card>
        <Card className={styles.customCardGraph1} header={smallCardHeader}>
          {/* <div className={styles.headerGraph1}>
            <h3 className="montserrat">
              {selectedFilter.charAt(0).toUpperCase() +
                selectedFilter.slice(1).toLowerCase()}{" "}
              Status Breakdown
            </h3>
            <Dropdown
              value={selectedFilter}
              options={filterOptions}
              onChange={(e) => setSelectedFilter(e.value)}
              placeholder="Select a role"
            />
          </div> */}
          <br />
          <div className={styles.filterContainer1}>
            <Chart
              type="pie"
              data={chartData1}
              options={chartOptions1}
              className={styles.doughnutChart}
            />
            <br />
            <br />
            <div className={styles.filterColumn}>
              <strong className={styles.line}>
                User Ratio: {userPercentage.proportion}%
              </strong>
              <br />
              <strong className={styles.line}>
                Active users: {userPercentage.active}%
              </strong>
              <br />
              <strong className={styles.line}>
                Inactive users: {userPercentage.inactive}%
              </strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStatisticsModal;
